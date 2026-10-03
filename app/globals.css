* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #0b111e;
  color: #f8fafc;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  padding: 40px 20px;
}

main {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-size: 2.6rem;
  font-weight: 800;
  background: linear-gradient(to right, #22d3ee, #0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

p {
  text-align: center;
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 40px;
  font-weight: 500;
}

form {
  background: #141b2d;
  border: 1px solid #222f47;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  align-items: end;
}

form div {
  display: flex;
  flex-direction: column;
  position: relative;
}

label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #38bdf8;
  margin-bottom: 8px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

select, input, .passenger-trigger {
  width: 100%;
  background-color: #1e293b;
  border: 1px solid #334155;
  padding: 14px 16px;
  border-radius: 12px;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  outline: none;
  transition: all 0.25s ease;
  height: 52px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

/* 📅 Luxury Customized Calendar UI Fields styling override */
input[type="date"] {
  position: relative;
  background-image: linear-gradient(to right, #1e293b, #1e293b);
  color-scheme: dark; /* Forces browser date popup to dark-mode theme */
}

input[type="date"]::-webkit-calendar-picker-indicator {
  background-color: #22d3ee;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

input[type="date"]::-webkit-calendar-picker-indicator:hover {
  transform: scale(1.1);
  background-color: #0ea5e9;
}

select:focus, input:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.25);
}

.passenger-trigger {
  justify-content: space-between;
}

.passenger-dropdown {
  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  background-color: #1e293b;
  border: 1px solid #222f47;
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.passenger-row {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.counter-actions {
  display: flex;
  flex-direction: row !important;
  gap: 12px;
  align-items: center;
}

.counter-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background-color: #334155;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter-btn:hover {
  background-color: #475569;
}

.submit-container {
  grid-column: 1 / -1;
  margin-top: 10px;
}

.search-btn {
  background: linear-gradient(to right, #0ea5e9, #22d3ee);
  color: #0f172a;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px 0 rgba(34, 211, 238, 0.3);
  width: 100%;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(34, 211, 238, 0.5);
}

/* ⚡ Perfect Motion Skeleton Searching Animation Effect Styles */
.skeleton-card {
  background: #141b2d;
  border: 1px solid #222f47;
  padding: 24px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-bar {
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: loadingShimmer 1.4s infinite linear;
}

@keyframes loadingShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.animate-pulse {
  animation: pulseEffect 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulseEffect {
  0%, 100% { opacity: 1; }
  50% { opacity: .6; }
}

/* Finished Ticket Results Cards */
.flight-card {
  background: linear-gradient(135deg, #141b2d 0%, #111827 100%);
  border: 1px solid #222f47;
  padding: 24px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.airline-name {
  font-size: 1.25rem;
  font-weight: 700;
}

.flight-subtext {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 4px;
}

.price-text {
  font-size: 1.75rem;
  font-weight: 800;
  color: #22d3ee;
}

.book-btn {
  margin-top: 10px;
  background-color: #1e293b;
  border: 1px solid #334155;
  color: #f1f5f9;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
