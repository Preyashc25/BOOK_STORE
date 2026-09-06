// src/components/books/ReviewStars.jsx
const ReviewStars = ({ value, onChange, readOnly = false }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`text-lg ${
            star <= value ? 'text-oxblood' : 'text-ink/20'
          } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:text-oxblood/70'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default ReviewStars;