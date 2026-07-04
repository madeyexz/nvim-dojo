export default function Keycap({ k }: { k: string }) {
  return <kbd className="kc">{k}</kbd>;
}

export function KeycapRow({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {keys.map((k, i) => (
        <Keycap key={i} k={k} />
      ))}
    </span>
  );
}
