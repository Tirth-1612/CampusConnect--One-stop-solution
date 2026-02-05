export default function EventCard({ item, onSave, saved }){
  return (
    <div className="card stack">
      <div className="card-subtle">{item.category || 'General'} • {new Date(item.start_time || Date.now()).toLocaleString()}</div>
      <div className="card-title">{item.title}</div>
      <div className="card-subtle">{item.description}</div>
      <div className="card-subtle">Event on : {item.event_date}</div>

      {onSave && <div className="card-actions">
        <button className="btn" onClick={() => onSave(item)}>{saved ? 'Unsave' : 'Save'}</button>
      </div>}
    </div>
  );
}
