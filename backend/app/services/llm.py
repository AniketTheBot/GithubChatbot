from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.services.vector_store import search_documents

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def generate_answer(question: str, history: list = []):
    # 1. Retrieve relevant code (RAG)
    # (Optional: You could use history to rephrase the question here, but let's keep it simple)
    relevant_docs = search_documents(question)
    context_text = "\n\n---\n\n".join([doc.page_content for doc in relevant_docs])
    
    # 2. Format History
    # Turn the list of dicts into a conversation string
    # e.g. "User: Hi\nAI: Hello\nUser: ..."
    conversation_history = ""
    for msg in history[-5:]: # Only keep the last 5 messages to save tokens
        role = "User" if msg["role"] == "user" else "AI"
        conversation_history += f"{role}: {msg['content']}\n"

    # 3. Create Prompt with History slot
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", """You are an expert developer. 
        You have access to a conversation history and code context.
        Answer the user's question based on the context.
        If the user refers to previous code (e.g., "rewrite it"), use the History to understand what "it" refers to.
        """),
        ("user", """
        History:
        {history}

        Context:
        {context}

        Question: {question}
        """)
    ])
    
    prompt = prompt_template.invoke({
        "history": conversation_history,
        "context": context_text, 
        "question": question
    })
    
    response = llm.invoke(prompt)
    
    return {
        "answer": response.content,
        "sources": [doc.metadata for doc in relevant_docs]
    }