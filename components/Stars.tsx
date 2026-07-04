export default function Stars({
  n,
  className = "",
}: {
  n: number;
  className?: string;
}) {
  return (
    <span className={`tracking-wider ${className}`} aria-label={`${n} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= n ? "text-yellow" : "text-faint"}>
          ★
        </span>
      ))}
    </span>
  );
}
