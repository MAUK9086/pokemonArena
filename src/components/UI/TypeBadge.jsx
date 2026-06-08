import { getTypeColor } from '../../utils/typeColors.js';

export function TypeBadge({ type }) {
  const { primary } = getTypeColor(type);
  return (
    <span className="type-badge" style={{ backgroundColor: primary }}>
      {type}
    </span>
  );
}
