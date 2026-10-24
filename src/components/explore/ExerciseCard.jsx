import { useState } from 'react';
import { fallbackImage } from '../../utils/exerciseImage';

export default function ExerciseCard({ exercise, onOpen }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <button type="button" className="ex-card" onClick={() => onOpen(exercise)}>
      <div className="ex-thumb">
        <img
          src={exercise.image && !imgFailed ? exercise.image : fallbackImage(exercise)}
          alt={exercise.name}
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      </div>
      <div className="ex-name">{exercise.name}</div>
      <div className="chips">
        {exercise.category && <span className="chip accent">{exercise.category}</span>}
        {exercise.muscles.slice(0, 2).map((m) => (
          <span className="chip" key={m}>
            {m}
          </span>
        ))}
      </div>
    </button>
  );
}
