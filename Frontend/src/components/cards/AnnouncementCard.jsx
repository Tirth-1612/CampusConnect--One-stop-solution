export default function AnnouncementCard({ item, onSave, saved }){
  return (
    <div className="card stack">
      <div className="card-subtle">{item.type} • {item.department || 'General'}</div>
      <div className="card-title">{item.title}</div>
      <div className="card-subtle">{item.description}</div>
      {/* {onSave && <div className="card-actions">
        <button className="btn" disabled={!!saved} onClick={() => onSave(item)}>{saved ? 'Saved' : 'Save'}</button>
      </div>} */}
    </div>
  );
}
