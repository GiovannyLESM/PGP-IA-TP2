// src/components/ProjectCard.tsx
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

export const ProjectCard = ({ id, nombre, descripcion, estado, fecha }: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 shadow-md rounded p-4 hover:shadow-lg transition cursor-pointer"
    >
      <h3 className="text-3xl font-bold mb-1">{nombre}</h3>
      <p className="text-sm text-gray-600 mb-2">{descripcion}</p>
      <p className="text-sm">
        Estado: <span className="font-semibold">{estado}</span>
      </p>
      <p className="text-xs text-gray-400">Fecha: {fecha}</p>
    </div>
  );
};
