type Props = {
  dimension: string;
  stat: string;
  note?: string;
  icon: string;
  accentClass: string;
};

export default function StatCallout({ dimension, stat, note, icon, accentClass }: Props) {
  return (
    <div className={`rounded-xl border p-5 flex gap-4 items-start ${accentClass}`}>
      <span className="text-2xl leading-none mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">{dimension}</p>
        <p className="text-base font-semibold leading-snug">{stat}</p>
        {note && <p className="text-xs opacity-60 mt-1">{note}</p>}
      </div>
    </div>
  );
}
