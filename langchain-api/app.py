from flask import Flask, request, jsonify
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from dotenv import load_dotenv

# Configurar Flask y entorno
load_dotenv()
app = Flask(__name__)
llm = ChatOpenAI(model='gpt-3.5-turbo', temperature=0.3)

# Historial por sesión
conversaciones = {}


@app.route('/planificar', methods=['POST'])
def planificar():
    data = request.json
    mensaje = data.get("mensaje")
    sesion_id = str(data.get("sesion_id", "default"))

    if sesion_id not in conversaciones:
        conversaciones[sesion_id] = [
            SystemMessage(content="""
Eres un asistente especializado exclusivamente en planificación de proyectos usando tableros Kanban.
No debes responder a preguntas fuera de ese contexto, como chistes, bromas, temas generales o personales.

Tu objetivo es:
1. Leer la descripción del proyecto.
2. Proponer listas con tareas, explicándolas en lenguaje natural primero.
3. Preguntar al usuario si desea confirmar la planificación antes de crearla como JSON.

Reglas importantes:
- No generes el JSON hasta que el usuario confirme claramente.
- Si el usuario dice cosas como "sí", "me gusta", "dale", "perfecto", "está bien", entonces considera que ha confirmado.
- Si el usuario dice "no", "cambia esto", "ajusta", "agrega otra lista", "me parece mal", "no estoy seguro", entonces considera que NO ha confirmado y ajusta la planificación.
- Si hay ambigüedad (por ejemplo: "no sé", "mmm tal vez", "falta algo"), responde con una pregunta aclaratoria o haz sugerencias.

Cuando confirmes, responde solo con el JSON en este formato exacto:

{
  "listas": [
    {
      "nombre": "Nombre de la lista",
      "tareas": [
        { "titulo": "Título de la tarea", "descripcion": "Descripción breve de la tarea" }
      ]
    }
  ]
}
""")
        ]

    # Agregar el nuevo mensaje del usuario
    conversaciones[sesion_id].append(HumanMessage(content=mensaje))

    # Obtener respuesta del modelo
    respuesta = llm.invoke(conversaciones[sesion_id])
    conversaciones[sesion_id].append(AIMessage(content=respuesta.content))

    return jsonify({"respuesta": respuesta.content})
