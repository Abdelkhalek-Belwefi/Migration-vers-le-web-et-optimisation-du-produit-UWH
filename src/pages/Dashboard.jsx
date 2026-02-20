const Dashboard = () => {
  const role = localStorage.getItem("role");

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Your role: {role}</p>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
