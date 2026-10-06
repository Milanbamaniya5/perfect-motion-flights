'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const [tripType, setTripType] = useState('return');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const [adults, setAdults] = useState(1);

  const [children, setChildren] = useState([]);
  const [infants, setInfants] = useState([]);

  const [cabin, setCabin] = useState('economy');
  const [showPassengers, setShowPassengers] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  function addChild() {
    setChildren([...children, 5]);
  }

  function removeChild(index) {
    setChildren(children.filter((_, i) => i !== index));
  }

  function updateChildAge(index, age) {
    const updated = [...children];
    updated[index] = Number(age);
    setChildren(updated);
  }

  function addInfant() {
    setInfants([...infants, 0]);
  }

  function removeInfant(index) {
    setInfants(infants.filter((_, i) => i !== index));
  }

  function updateInfantAge(index, age) {
    const updated = [...infants];
    updated[index] = Number(age);
    setInfants(updated);
  }

  function swapLocations() {
    const oldFrom = from;
    setFrom(to);
    setTo(oldFrom);
  }

  function handleSearch(e) {
    e.preventDefault();

    if (!from.trim()) {
      alert('Please enter departure airport or city.');
      return;
    }

    if (!to.trim()) {
      alert('Please enter destination airport or city.');
      return;
    }

    if (!departureDate) {
      alert('Please select departure date.');
      return;
    }

    if (tripType === 'return' && !returnDate) {
      alert('Please select return date.');
      return;
    }

    if (tripType === 'return' && returnDate < departureDate) {
      alert('Return date cannot be before departure date.');
      return;
    }

    const params = new URLSearchParams();

    params.set('from', from.trim());
    params.set('to', to.trim());
    params.set('departureDate', departureDate);
    params.set('tripType', tripType);
    params.set('adults', String(adults));
    params.set('cabin', cabin);

    if (tripType === 'return') {
      params.set('returnDate', returnDate);
    }

    children.forEach((age) => {
      params.append('childAge', String(age));
    });

    infants.forEach((age) => {
      params.append('infantAge', String(age));
    });

    router.push(`/search?${params.toString()}`);
  }

  const totalPassengers =
    adults + children.length + infants.length;

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

          <div
            className="text-2xl font-extrabold tracking-tight cursor-pointer"
            onClick={() => router.push('/')}
          >
            <span className="text-blue-600">Trip</span>{' '}
            <span className="text-slate-900">Scanner</span>{' '}
            <span className="text-blue-600">Hub</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button>Flights</button>
            <button>Hotels</button>
            <button>Manage Booking</button>
            <button>Help</button>
          </div>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-5 pt-14 pb-28">

          <div className="text-center text-white mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Find your perfect flight
            </h1>

            <p className="text-blue-100 text-lg">
              Compare flights from airlines and travel providers in one place
            </p>
          </div>

          {/* SEARCH BOX */}
          <div className="bg-white rounded-3xl shadow-2xl p-5 md:p-7 max-w-6xl mx-auto">

            {/* TRIP TYPE */}
            <div className="flex flex-wrap items-center gap-5 mb-6">

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tripType"
                  value="return"
                  checked={tripType === 'return'}
                  onChange={() => setTripType('return')}
                  className="w-4 h-4"
                />
                <span className="font-semibold">Return</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tripType"
                  value="oneway"
                  checked={tripType === 'oneway'}
                  onChange={() => setTripType('oneway')}
                  className="w-4 h-4"
                />
                <span className="font-semibold">One way</span>
              </label>

            </div>

            <form onSubmit={handleSearch}>

              {/* FROM / TO */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    From
                  </label>

                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="London, LHR"
                    className="w-full h-14 rounded-xl border border-slate-300 px-4 text-lg font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={swapLocations}
                  className="hidden md:flex w-12 h-12 rounded-full border border-slate-300 items-center justify-center hover:bg-slate-50 text-xl"
                  title="Swap airports"
                >
                  ⇄
                </button>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    To
                  </label>

                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Ahmedabad, AMD"
                    className="w-full h-14 rounded-xl border border-slate-300 px-4 text-lg font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>

              {/* DATES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Departure
                  </label>

                  <input
                    type="date"
                    min={today}
                    value={departureDate}
                    onChange={(e) => {
                      setDepartureDate(e.target.value);

                      if (
                        returnDate &&
                        returnDate < e.target.value
                      ) {
                        setReturnDate('');
                      }
                    }}
                    className="w-full h-14 rounded-xl border border-slate-300 px-4 font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Return
                  </label>

                  <input
                    type="date"
                    min={departureDate || today}
                    value={returnDate}
                    disabled={tripType === 'oneway'}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className={`w-full h-14 rounded-xl border px-4 font-semibold outline-none ${
                      tripType === 'oneway'
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                </div>

              </div>

              {/* PASSENGERS + CABIN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">

                {/* PASSENGERS */}
                <div className="relative">

                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Passengers
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassengers(!showPassengers)
                    }
                    className="w-full h-14 rounded-xl border border-slate-300 px-4 flex items-center justify-between text-left hover:border-blue-500"
                  >
                    <div>
                      <div className="font-bold">
                        {totalPassengers}{' '}
                        {totalPassengers === 1
                          ? 'traveller'
                          : 'travellers'}
                      </div>

                      <div className="text-xs text-slate-500">
                        {adults} adult
                        {adults !== 1 ? 's' : ''}
                        {children.length > 0 &&
                          ` · ${children.length} child${
                            children.length !== 1 ? 'ren' : ''
                          }`}
                        {infants.length > 0 &&
                          ` · ${infants.length} infant${
                            infants.length !== 1 ? 's' : ''
                          }`}
                      </div>
                    </div>

                    <span className="text-slate-500">⌄</span>
                  </button>

                  {showPassengers && (
                    <div className="absolute z-50 mt-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5">

                      {/* ADULT */}
                      <div className="flex items-center justify-between py-3 border-b border-slate-100">

                        <div>
                          <div className="font-bold">Adults</div>
                          <div className="text-xs text-slate-500">
                            18+ years
                          </div>
                        </div>

                        <div className="flex items-center gap-3">

                          <button
                            type="button"
                            disabled={adults <= 1}
                            onClick={() =>
                              setAdults(Math.max(1, adults - 1))
                            }
                            className="w-9 h-9 rounded-full border border-slate-300 disabled:opacity-40 text-lg"
                          >
                            −
                          </button>

                          <span className="w-6 text-center font-bold">
                            {adults}
                          </span>

                          <button
                            type="button"
                            disabled={adults >= 9}
                            onClick={() =>
                              setAdults(Math.min(9, adults + 1))
                            }
                            className="w-9 h-9 rounded-full border border-slate-300 disabled:opacity-40 text-lg"
                          >
                            +
                          </button>

                        </div>

                      </div>

                      {/* CHILDREN */}
                      <div className="py-4 border-b border-slate-100">

                        <div className="flex items-center justify-between mb-3">

                          <div>
                            <div className="font-bold">Children</div>
                            <div className="text-xs text-slate-500">
                              Age 2–17 years
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={addChild}
                            disabled={children.length >= 8}
                            className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold disabled:opacity-40"
                          >
                            + Add child
                          </button>

                        </div>

                        {children.map((age, index) => (
                          <div
                            key={`child-${index}`}
                            className="flex items-center justify-between gap-3 mb-2"
                          >

                            <span className="text-sm font-medium">
                              Child {index + 1}
                            </span>

                            <div className="flex items-center gap-2">

                              <select
                                value={age}
                                onChange={(e) =>
                                  updateChildAge(
                                    index,
                                    e.target.value
                                  )
                                }
                                className="h-10 rounded-lg border border-slate-300 px-3 font-semibold"
                              >
                                {Array.from(
                                  { length: 16 },
                                  (_, i) => i + 2
                                ).map((childAge) => (
                                  <option
                                    key={childAge}
                                    value={childAge}
                                  >
                                    {childAge} years
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() =>
                                  removeChild(index)
                                }
                                className="w-9 h-9 rounded-lg border border-red-200 text-red-600"
                              >
                                ×
                              </button>

                            </div>

                          </div>
                        ))}

                        {children.length === 0 && (
                          <div className="text-xs text-slate-400">
                            No children added
                          </div>
                        )}

                      </div>

                      {/* INFANTS */}
                      <div className="py-4">

                        <div className="flex items-center justify-between mb-3">

                          <div>
                            <div className="font-bold">Infants</div>
                            <div className="text-xs text-slate-500">
                              Under 2 years
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={addInfant}
                            disabled={
                              infants.length >= adults ||
                              infants.length >= 8
                            }
                            className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold disabled:opacity-40"
                          >
                            + Add infant
                          </button>

                        </div>

                        {infants.map((age, index) => (
                          <div
                            key={`infant-${index}`}
                            className="flex items-center justify-between gap-3 mb-2"
                          >

                            <span className="text-sm font-medium">
                              Infant {index + 1}
                            </span>

                            <div className="flex items-center gap-2">

                              <select
                                value={age}
                                onChange={(e) =>
                                  updateInfantAge(
                                    index,
                                    e.target.value
                                  )
                                }
                                className="h-10 rounded-lg border border-slate-300 px-3 font-semibold"
                              >
                                <option value="0">
                                  0 years
                                </option>
                                <option value="1">
                                  1 year
                                </option>
                              </select>

                              <button
                                type="button"
                                onClick={() =>
                                  removeInfant(index)
                                }
                                className="w-9 h-9 rounded-lg border border-red-200 text-red-600"
                              >
                                ×
                              </button>

                            </div>

                          </div>
                        ))}

                        {infants.length === 0 && (
                          <div className="text-xs text-slate-400">
                            No infants added
                          </div>
                        )}

                        {infants.length >= adults && (
                          <div className="text-xs text-amber-600 mt-2">
                            Maximum 1 infant per adult.
                          </div>
                        )}

                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setShowPassengers(false)}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold"
                        >
                          Done
                        </button>
                      </div>

                    </div>
                  )}

                </div>

                {/* CABIN */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Cabin class
                  </label>

                  <select
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value)}
                    className="w-full h-14 rounded-xl border border-slate-300 px-4 font-semibold bg-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="economy">
                      Economy
                    </option>
                    <option value="premium_economy">
                      Premium Economy
                    </option>
                    <option value="business">
                      Business
                    </option>
                    <option value="first">
                      First Class
                    </option>
                  </select>
                </div>

              </div>

              {/* SEARCH BUTTON */}
              <button
                type="submit"
                className="w-full mt-6 h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg shadow-lg transition"
              >
                Search flights
              </button>

            </form>

          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-5 py-14">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="text-3xl mb-4">✈️</div>
            <h3 className="font-bold text-lg mb-2">
              Compare flights
            </h3>
            <p className="text-slate-500 text-sm">
              Compare multiple airlines and flight options in one place.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="font-bold text-lg mb-2">
              Find better prices
            </h3>
            <p className="text-slate-500 text-sm">
              See prices clearly per passenger before you book.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="font-bold text-lg mb-2">
              Simple booking
            </h3>
            <p className="text-slate-500 text-sm">
              Enter passenger details and continue through a simple booking flow.
            </p>
          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-5 py-8 text-sm flex flex-col md:flex-row justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Trip Scanner Hub
          </div>

          <div className="flex gap-5">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Help</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
