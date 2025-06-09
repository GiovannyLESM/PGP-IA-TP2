from flask import Flask, request, jsonify
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from dotenv import load_dotenv

# Cargar variables de entorno (.env)
load_dotenv()

# Configurar modelo LLM
llm = ChatOpenAI(model='gpt-3.5-turbo', temperature=0.3)

# Flask
app = Flask(__name__)

# Diccionario para mantener el historial de cada sesión de usuario
conversaciones = {}


@app.route('/planificar', methods=['POST'])
def planificar():
    data = request.json
    mensaje = data.get("mensaje")
    sesion_id = str(data.get("sesion_id", "default"))

    if sesion_id not in conversaciones:
        conversaciones[sesion_id] = [
            SystemMessage(content="""
Eres un experto en planificación de proyectos web usando tableros tipo Trello.
Tu objetivo es proponer listas personalizadas (como 'Diseño Web', 'Backend', etc.).
Cada lista debe tener tareas con título y descripción.
Primero responde en lenguaje natural (no JSON) y pregunta si desea confirmar.
Cuando el usuario confirme, recién devuelves el JSON con este formato:

{
  "listas": [
    {
      "nombre": "Nombre de la lista",
      "tareas": [
        { "titulo": "Título de la tarea", "descripcion": "Descripción breve" }
      ]
    }
  ]
}
""")
        ]

    conversaciones[sesion_id].append(HumanMessage(content=mensaje))
    respuesta = llm.invoke(conversaciones[sesion_id])
    conversaciones[sesion_id].append(AIMessage(content=respuesta.content))

    return jsonify({"respuesta": respuesta.content})
