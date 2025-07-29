import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitVote } from '../../Redux/slices/voteSlice';
import { Icon } from "@iconify/react";
import PropTypes from 'prop-types';

const chipColors = [
  'sondage-chip-blue',
  'sondage-chip-yellow',
  'sondage-chip-orange',
  'sondage-chip-pink',
  'sondage-chip-purple',
  'sondage-chip-cyan',
  'sondage-chip-lime',
  'sondage-chip-indigo',
  'sondage-chip-teal',
  'sondage-chip-amber',
];

function getChipColor(answer, idx) {
  if (!answer || typeof answer !== 'string') return chipColors[idx % chipColors.length];
  const lower = answer.trim().toLowerCase();
  if (lower === 'oui' || lower === 'yes') return 'sondage-chip-green';
  if (lower === 'non' || lower === 'no') return 'sondage-chip-red';
  return chipColors[idx % chipColors.length];
}

export default function SondageVote({ publication, canVote, onVoted }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector(state => state.vote);
  const user = useSelector(state => state.auth.user);

  const question = publication.questions?.[0];
  let previousVote = null;
  if (user && publication.votes && Array.isArray(publication.votes)) {
    previousVote = publication.votes.find(
      v => v.user_id === user.id || (v.user && v.user.id === user.id)
    );
  }
  const [selectedAnswer, setSelectedAnswer] = useState(previousVote ? previousVote.answer_id : null);
  const [voted, setVoted] = useState(!!previousVote);

  const handleVote = (ansId) => {
    if (!canVote || voted) return;
    setSelectedAnswer(ansId);
    dispatch(submitVote({ answer_id: ansId }));
    setVoted(true);
    if (typeof onVoted === 'function') onVoted();
  };

  if (!question) return null;

  return (
    <div>
      <div className="sondage-question">{question.question}</div>
      <div className="sondage-chips">
        {question.answers.map((ans, idx) => {
          const isSelected = selectedAnswer === ans.id;
          const isDisabled = voted || !canVote;
          const chipColor = getChipColor(ans.answer, idx);

          // Style vibrant pour le chip sélectionné
          const vibrantStyle = isSelected && voted ? {
            background: chipColor === 'sondage-chip-green'
              ? 'linear-gradient(90deg,#22c55e 60%,#4ade80 100%)'
              : chipColor === 'sondage-chip-red'
                ? 'linear-gradient(90deg,#ef4444 60%,#f87171 100%)'
                : 'linear-gradient(90deg,#6366f1 50%,#16a34a 100%)',
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: chipColor === 'sondage-chip-green'
              ? '0 0 14px #22c55e'
              : chipColor === 'sondage-chip-red'
                ? '0 0 14px #ef4444'
                : '0 0 12px #6366f1',
            border: chipColor === 'sondage-chip-green'
              ? '2px solid #22c55e'
              : chipColor === 'sondage-chip-red'
                ? '2px solid #ef4444'
                : '2px solid #6366f1',
            animation: 'pulse 1.2s infinite',
          } : {};

          return (
            <button
              key={ans.id}
              type="button"
              className={`sondage-chip ${chipColor} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => handleVote(ans.id)}
              disabled={isDisabled}
              style={vibrantStyle}
            >
              {ans.answer}
              {isSelected && voted && <Icon icon="mdi:check-circle" className="ml-2 text-white" style={{fontSize:22}} />}
            </button>
          );
        })}
      </div>
      {voted && (
        <div className="sondage-info">
          <span className="text-green-700 font-bold">Votre vote a été pris en compte !</span>
        </div>
      )}
      {status === 'success' && !voted && (
        <div className="sondage-info" style={{ color: "#16a34a" }}>Merci pour votre vote !</div>
      )}
      {status === 'fail' && (
        <div className="sondage-info" style={{ color: "#ef4444" }}>{error}</div>
      )}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 #6366f199; }
          70% { box-shadow: 0 0 0 10px #6366f100; }
          100% { box-shadow: 0 0 0 0 #6366f199; }
        }
      `}</style>
    </div>
  );
}

SondageVote.propTypes = {
  publication: PropTypes.object.isRequired,
  canVote: PropTypes.bool,
  onVoted: PropTypes.func,
};
