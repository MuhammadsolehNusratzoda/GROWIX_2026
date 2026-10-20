export default function Message({ message }) {
  if (!message) return null;
  return <div className={`msg ${message.type === 'ok' ? 'msg-ok' : 'msg-error'}`}>{message.text}</div>;
}
