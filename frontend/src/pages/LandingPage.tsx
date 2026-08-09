import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="text-center py-12 max-w-4xl mx-auto">
      <div className="text-6xl mb-6">📚</div>
      <h1 className="font-serif text-5xl font-bold text-[var(--forest-dark)] leading-tight mb-4">
        Lend a book, help a student
      </h1>
      <p className="text-lg text-[var(--ink-soft)] leading-relaxed mb-8 max-w-lg mx-auto">
        Bookify is a free textbook lending platform for college students. Lend textbooks you no longer use, or borrow books you need for your courses — 100% free with no money involved.
      </p>

      <div className="flex justify-center gap-4">
        <Link to="/register" className="btn-bookify btn-forest text-base px-6 py-3">
          Get Started — Free
        </Link>
        <Link to="/search" className="btn-bookify btn-paper text-base px-6 py-3">
          Browse Books to Borrow
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="bg-[var(--paper)] p-6 rounded-xl border border-[var(--line)] shadow-xs">
          <div className="text-3xl mb-3">📖</div>
          <h3 className="font-serif font-bold text-[var(--forest-dark)] text-lg mb-2">1. Lend Your Books</h3>
          <p className="text-xs text-[var(--ink-soft)] leading-normal">
            List textbooks you finished last semester so other students can borrow them.
          </p>
        </div>

        <div className="bg-[var(--paper)] p-6 rounded-xl border border-[var(--line)] shadow-xs">
          <div className="text-3xl mb-3">📜</div>
          <h3 className="font-serif font-bold text-[var(--forest-dark)] text-lg mb-2">2. Request to Borrow</h3>
          <p className="text-xs text-[var(--ink-soft)] leading-normal">
            Find required course books and send a borrowing request directly to lenders.
          </p>
        </div>

        <div className="bg-[var(--paper)] p-6 rounded-xl border border-[var(--line)] shadow-xs">
          <div className="text-3xl mb-3">🤝</div>
          <h3 className="font-serif font-bold text-[var(--forest-dark)] text-lg mb-2">3. 100% Free & No Money</h3>
          <p className="text-xs text-[var(--ink-soft)] leading-normal">
            A community platform focused on helping students succeed without financial barriers.
          </p>
        </div>
      </div>
    </div>
  );
};
