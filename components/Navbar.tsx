export default function Navbar() {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-around",
      padding: "10px",
      background: "black",
      color: "white"
    }}>
      <a href="/requests">Requests</a>
      <a href="/creators">Creators</a>
      <a href="/">Home</a>
      <a href="/login">Login</a>
      <a href="/register">Register</a>
      <a href="/dashboard">Dashboard</a>
      <a href="/profile">Profile</a>
    </nav>
  );
}