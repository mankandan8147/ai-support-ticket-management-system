
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Search,
  Headset,
  Menu
} from 'lucide-react';

import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket
} from './services/api';

import './App.css';

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activePage, setActivePage] = useState('Dashboard');

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open'
  });

  const fetchTickets = async () => {
    try {
      const response = await getTickets();
      setTickets(response.data);
      setError('');
    } catch (err) {
      setError('Unable to load tickets. Check your Django server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createTicket(form);
      setForm({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Open'
      });
      await fetchTickets();
      alert('Ticket created successfully!');
    } catch (err) {
      alert('Unable to create ticket.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateTicket(id, { status });
      await fetchTickets();
    } catch (err) {
      alert('Unable to update ticket status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) {
      return;
    }

    try {
      await deleteTicket(id);
      await fetchTickets();
    } catch (err) {
      alert('Unable to delete ticket.');
    }
  };
  const filteredTickets = tickets.filter((ticket) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      (ticket.title || '').toLowerCase().includes(searchText) ||
      (ticket.description || '').toLowerCase().includes(searchText);

    const matchesStatus =
      !statusFilter || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
});

  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'Open').length;
  const progress = tickets.filter(t => t.status === 'In Progress').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="app-layout">

      <aside className="sidebar">
        <div className="brand">
          <Headset size={27} />
          <h2>SupportDesk</h2>
        </div>

        <p className="menu-label">MAIN MENU</p>

        <button
          className={`nav-item ${activePage === 'Dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('Dashboard')}
        >
          <LayoutDashboard size={19} />
          Dashboard
        </button>

        <button
          className={`nav-item ${activePage === 'Tickets' ? 'active' : ''}`}
          onClick={() => setActivePage('Tickets')}
        >
          <Ticket size={19} />
          All Tickets
        </button>

        <button
          className={`nav-item ${activePage === 'Create Ticket' ? 'active' : ''}`}
          onClick={() => setActivePage('Create Ticket')}
        >
          <PlusCircle size={19} />
          Create Ticket
        </button>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">A</div>
            <div>
              <strong>Admin</strong>
              <span>Support Manager</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">

        <header className="topbar">
          <div>
            <h2>{activePage}</h2>
            <p>Welcome back! Here's your support overview.</p>
          </div>
          <div className="topbar-right">
            <span className="admin-label">Administrator</span>
            <div className="avatar">A</div>
          </div>
        </header>

        <div className="page-content">

          {activePage === 'Dashboard' && (
            <>
              <div className="stats">
                <div className="stat-card">
                  <span>Total Tickets</span>
                  <h1>{total}</h1>
                  <small>All support requests</small>
                </div>

                <div className="stat-card">
                  <span>Open Tickets</span>
                  <h1>{open}</h1>
                  <small>Awaiting attention</small>
                </div>

                <div className="stat-card">
                  <span>In Progress</span>
                  <h1>{progress}</h1>
                  <small>Currently being handled</small>
                </div>

                <div className="stat-card">
                  <span>Resolved</span>
                  <h1>{resolved}</h1>
                  <small>Successfully completed</small>
                </div>
              </div>

              <section className="tickets">
                <h2>Recent Support Tickets</h2>
                <button
                  className="primary-button"
                  onClick={() => setActivePage('Create Ticket')}
                >
                  <PlusCircle size={17} /> New Ticket
                </button>
                <TicketTable
                  tickets={tickets.slice(0, 5)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  loading={loading}
                  error={error}
                />
              </section>
            </>
          )}

          {activePage === 'Create Ticket' && (
            <section className="tickets">
              <h2>Create a New Support Ticket</h2>

              <form onSubmit={handleSubmit} className="ticket-form">
                <label>Ticket Title</label>
                <input
                  name="title"
                  placeholder="Enter ticket title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />

                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the issue..."
                  value={form.description}
                  onChange={handleChange}
                  required
                />

                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <button type="submit" className="primary-button">
                  Create Ticket
                </button>
              </form>
            </section>
          )}

          {activePage === 'Tickets' && (
            <section className="tickets">
              <h2>All Support Tickets</h2>

              <div className="filters">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <TicketTable
                tickets={filteredTickets}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                loading={loading}
                error={error}
              />
            </section>
          )}

        </div>
      </main>
    </div>
  );
}

function TicketTable({ tickets, onStatusChange, onDelete, loading, error }) {
  if (loading) return <p>Loading tickets...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ticket Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>#{ticket.id}</td>
              <td>{ticket.title}</td>
              <td>
                <span className={`priority ${ticket.priority.toLowerCase()}`}>
                  {ticket.priority}
                </span>
              </td>
              <td>
                <select
                  className={`status-select ${ticket.status.toLowerCase().replace(' ', '-')}`}
                  value={ticket.status}
                  onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </td>
              <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
              <td>
                <button
                  className="delete-button"
                  onClick={() => onDelete(ticket.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tickets.length === 0 && <p className="empty-message">No tickets found.</p>}
    </div>
  );
}

export default App;
