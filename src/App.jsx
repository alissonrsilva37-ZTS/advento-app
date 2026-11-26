The user wants to adjust the App.jsx file, removing notifications and leaving only the daily page unlock at day change (midnight). They ask to rewrite the entire file. We must output the full code with modifications: remove alarm state, permission, notification request, use unlocking based on date only (no hour). Also adjust UI: remove settings rows related to notifications, maybe keep reset progress. The user wants just the file content. Provide code block with language (javascript). Ensure we follow tool guidance: use code block with language. Provide final file content.

We need to modify:

Imports: remove Bell, Clock3 maybe still used in UI for hero time? The hero shows "LEMBRETE DIÁRIO • 18:00". Could keep but not needed. But we can keep icons but not functionality. Remove Bell from imports? It's used in top bar button and settings modal. We should remove that button or change to something else. Simpler: keep import but not use? Might cause lint warnings but fine. But better to remove Bell usage.

Remove alarm state, permission state, related useEffects.

Update unlocked calculation: currently uses elapsed + (now.getHours() >= DAILY_REMINDER_HOUR ? 1 : 0). Should be just elapsed + 1? Actually day 1 unlock at start date. At start date, elapsed = 0 (if currentDate same as start). We want day 1 unlocked on start date (26/11). So unlocked = Math.min(29, Math.max(0, elapsed + 1)). Because day 1 is available on start date. So implement unlocked = Math.min(29, Math.max(0, elapsed + 1)). Or simply unlocked = Math.min(29, elapsed + 1). Ensure non-negative.

Remove any UI referencing reminder status, alarm toggle, requestPermission button, notice about reminder.

In settings modal, keep reset progress and maybe close button.

Remove top bar icon button for settings? Could keep but open settings without notification options. Keep settings button but maybe change icon to Menu? But we can keep Bell icon but it's fine. But the user only asked to remove notifications; UI can stay but without notification logic. Simpler: keep button but settings modal will not have notification rows. We'll adjust modal content.

Remove useEffect for notification.

Remove requestPermission function.

Remove alarm state and permission state definitions.

Remove useEffect that writes alarm to localStorage.

Remove any references to alarm, permission, reminderStatus.

In the hero bottom, maybe remove hero-time line about reminder. Not required but okay.

In settings modal, remove the row with Bell and switch, and the button for permission, and the notice about reminder.

Keep reset row.

Ensure imports: we can remove Bell, Clock3 maybe still used in hero-time. If we keep hero-time, we need Clock3. But we could keep it; it's just display. It's okay.

Ensure any references to alarm variable removed.

Ensure toggleDone, goDay, resetProgress remain.

Ensure unlocked variable used for navigation etc.

Implement modifications.

Now produce final code.

javascript
Copiar
import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  LockKeyhole,
  Menu,
  RotateCcw,
  Sparkles,
  Sprout,
  X,
} from 'lucide-react';
import { devotionals, START_DATE } from './devotionals';

const AUDIENCES = devotionals[0].audiences;
const STORAGE_KEY = 'advento-jornada-v1';

// Helper: devolve a data de hoje no formato YYYY‑MM‑DD
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
};

// Diferença em dias entre duas datas (ambas no formato YYYY‑MM‑DD)
const dayDiff = (a, b) =>
  Math.floor((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000);

// Lê o progresso salvo no localStorage
const readSaved = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

export default function App() {
  // ---------- Estado ----------
  const [saved, setSaved] = useState(readSaved);
  const [audience, setAudience] = useState('adultos');
  const [selectedDay, setSelectedDay] = useState(1);
  const [now, setNow] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState('');

  // ---------- Cálculo de desbloqueio ----------
  const currentDate = todayISO();
  const elapsed = dayDiff(START_DATE, currentDate);
  // A primeira lição (dia 1) está disponível no dia de início.
  const unlocked = Math.min(29, Math.max(0, elapsed + 1));

  // ---------- Progresso ----------
  const progress = useMemo(() => {
    const total = 29 * 4; // 29 dias × 4 audiências
    const done = Object.values(saved.completed || {}).filter(Boolean).length;
    return { done, total, pct: Math.round((done / total) * 100) };
  }, [saved]);

  // Dados da lição selecionada
  const devotional = devotionals[selectedDay - 1];
  const audienceData = devotional.audiences.find((a) => a.id === audience);
  const isDone = !!saved.completed?.[`${selectedDay}:${audience}`];
  const daysLeft = Math.max(0, 29 - unlocked);

  // ---------- Efeitos ----------
  // Atualiza o relógio a cada 30 s (necessário apenas para forçar re‑render)
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    const onVisible = () => {
      if (!document.hidden) setNow(new Date());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // Salva progresso no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  // ---------- Funções ----------
  const toggleDone = () => {
    const key = `${selectedDay}:${audience}`;
    setSaved((prev) => ({
      ...prev,
      completed: { ...(prev.completed || {}), [key]: !prev.completed?.[key] },
    }));
  };

  const goDay = (n) => {
    if (n >= 1 && n <= unlocked) {
      setSelectedDay(n);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetProgress = () => {
    if (
      window.confirm(
        'Apagar todas as atividades concluídas neste navegador? Esta ação não pode ser desfeita.'
      )
    ) {
      setSaved({});
      setShowSettings(false);
      setToast('Progresso reiniciado');
      setTimeout(() => setToast(''), 3000);
    }
  };

  // Formatação de datas para exibição
  const dateLabel = new Date(`${START_DATE}T12:00:00`).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  });
  const selectedDate = new Date(
    new Date(`${START_DATE}T12:00:00`).getTime() + (selectedDay - 1) * 86400000
  ).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  // ---------- Render ----------
  return (
    <div className="app-shell">
      {/* Header */}
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setSelectedDay(Math.max(1, unlocked));
          }}
        >
          <span className="brand-mark">
            <Sprout size={22} />
          </span>
          <span>
            ADVENTO<span className="brand-light">.JORNADA</span>
          </span>
        </a>
        <div className="top-actions">
          <span className="year-pill">EDIÇÃO 2026</span>
          <button
            className="icon-btn"
            aria-label="Configurações"
            onClick={() => setShowSettings(true)}
          >
            <Menu size={19} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-orb orb-one"></div>
          <div className="hero-orb orb-two"></div>
          <div className="hero-content">
            <div className="eyebrow">
              <Sparkles size={14} /> UMA JORNADA DE 29 DIAS
            </div>
            <h1>
              Prepare o coração.<br />
              <em>Transforme atitudes.</em>
            </h1>
            <p>
              Uma nova oportunidade por dia para crescer na fé, no amor e no
              caráter — com a Palavra no centro.
            </p>
            <div className="hero-bottom">
              <div className="hero-date">
                <CalendarDays size={16} />
                <span>26 NOV — 24 DEZ, 2026</span>
              </div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="wreath">✳</div>
            <div className="candle candle-a"></div>
            <div className="candle candle-b"></div>
            <div className="candle candle-c"></div>
            <div className="candle candle-d"></div>
            <div className="flame"></div>
          </div>
        </section>

        {/* Progresso geral */}
        <section className="progress-panel">
          <div className="progress-copy">
            <div>
              <span className="section-kicker">SUA CAMINHADA</span>
              <h2>Progresso geral</h2>
            </div>
            <div className="progress-number">
              {progress.pct}
              <small>%</small>
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress.pct}%` }} />
          </div>
          <div className="progress-meta">
            <span>
              {progress.done} de {progress.total} atividades concluídas
            </span>
            <span>{unlocked} de 29 dias liberados</span>
          </div>
        </section>

        {/* Contador de dias liberados */}
        <section className="today-row">
          <div>
            <span className="section-kicker">CALENDÁRIO PROGRESSIVO</span>
            <h2>Uma lição por dia</h2>
            <p>Depois de liberada, cada lição fica disponível para sempre.</p>
          </div>
          <div className="unlock-count">
            <strong>{String(unlocked).padStart(2, '0') + <span>/29</span>}</strong>
            <small>
              {unlocked === 29
                ? 'Jornada completa'
                : daysLeft === 29
                ? 'Começa em 26 de novembro'
                : `${daysLeft} dias para liberar tudo`}
            </small>
          </div>
        </section>

        {/* Grade do calendário */}
        <section className="calendar-grid" aria-label="Calendário de Advento">
          {devotionals.map((d) => {
            const open = d.day <= unlocked;
            const count = d.audiences.filter((a) => saved.completed?.[`${d.day}:${a.id}`]).length;
            return (
              <button
                key={d.day}
                className={`day-tile ${open ? 'open' : 'locked'} ${
                  selectedDay === d.day ? 'selected' : ''
                }`}
                disabled={!open}
                onClick={() => goDay(d.day)}
              >
                <span className="tile-top">
                  <span>DIA {String(d.day).padStart(2, '0')}</span>
                  {open ? (
                    <span className="tile-check">
                      {count === 4 ? (
                        <CheckCircle2 size={15} />
                      ) : count > 0 ? (
                        `${count}/4`
                      ) : (
                        ''
                      )}
                    </span>
                  ) : (
                    <LockKeyhole size={14} />
                  )}
                </span>
                <strong>
                  {d.day === 1
                    ? 'Gratidão'
                    : d.day === 29
                    ? 'Cristo no centro'
                    : d.title.split(':')[0]}
                </strong>
                <small>
                  {new Date(
                    new Date(`${START_DATE}T12:00:00`).getTime() + (d.day - 1) * 86400000
                  ).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </small>
              </button>
            );
          })}
        </section>

        {/* Conteúdo da lição ou tela de espera */}
        {unlocked === 0 ? (
          <section className="waiting-card">
            <div className="waiting-icon">🕯️</div>
            <span className="section-kicker">
              A JORNADA COMEÇA EM {dateLabel.toUpperCase()}
            </span>
            <h2>Um tempo de preparação.</h2>
            <p>
              O primeiro devocional será liberado em 26 de novembro de 2026.
            </p>
          </section>
        ) : (
          <section className="lesson-section" id="lesson">
            <div className="lesson-heading">
              <div>
                <span className="section-kicker">
                  DIA {String(selectedDay).padStart(2, '0')} • {selectedDate.toUpperCase()}
                </span>
                <h2>{devotional.title}</h2>
              </div>
              <span className="available-tag">
                <Check size={13} /> LIBERADO
              </span>
            </div>

            <div className="scripture-card">
              <div className="scripture-icon">
                <BookOpen size={20} />
              </div>
              <div>
                <span>LEITURA BÍBLICA</span>
                <strong>{devotional.reference}</strong>
                <small>Leia o texto na sua Bíblia, observando o contexto.</small>
              </div>
            </div>

            <div className="reflection-card">
              <span className="section-kicker">REFLEXÃO DO DIA</span>
              <p>{devotional.reflection}</p>
            </div>

            <div className="audience-head">
              <div>
                <span className="section-kicker">ESCOLHA SUA JORNADA</span>
                <h3>Uma lição para cada fase</h3>
              </div>
              <span className="audience-count">4 VERSÕES</span>
            </div>

            <div className="audience-tabs">
              {AUDIENCES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAudience(a.id)}
                  className={audience === a.id ? 'active' : ''}
                >
                  <span>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>

            <article className="audience-card">
              <div className="audience-card-top">
                <div className="audience-icon">{audienceData.icon}</div>
                <div>
                  <span className="section-kicker">
                    DEVOCIONAL • {audienceData.label.toUpperCase()}
                  </span>
                  <h3>{audienceData.subtitle}</h3>
                </div>
              </div>
              <p>{audienceData.lesson}</p>

              <div className="task-box">
                <div className="task-label">
                  <Flame size={16} /> MISSÃO DE HOJE
                </div>
                <p>{audienceData.activity}</p>
              </div>

              <button onClick={toggleDone} className={`complete-btn ${isDone ? 'completed' : ''}`}>
                {isDone ? (
                  <>
                    <CheckCircle2 size={19} /> Atividade concluída
                  </>
                ) : (
                  <>
                    <Check size={19} /> Marcar atividade como concluída
                  </>
                )}
              </button>

              <p className="completion-note">
                Seu progresso fica salvo neste dispositivo. Você pode desmarcar se precisar
                corrigir.
              </p>
            </article>

            <div className="lesson-nav">
              <button
                className="nav-btn"
                disabled={selectedDay === 1}
                onClick={() => goDay(selectedDay - 1)}
              >
                <ChevronLeft size={17} /> Dia anterior
              </button>
              <button
                className="nav-btn next"
                disabled={selectedDay >= unlocked}
                onClick={() => goDay(selectedDay + 1)}
              >
                Próximo dia <ChevronRight size={17} />
              </button>
            </div>
          </section>
        )}

        {/* Mensagem de encerramento */}
        <section className="closing-note">
          <Heart size={18} />
          <p>
            <strong>Não é sobre cumprir tarefas perfeitamente.</strong>
            <br />
            É sobre cultivar uma fé viva, relacionamentos saudáveis e atitudes que
            apontem para Cristo.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <span>ADVENTO.JORNADA © 2026</span>
        <span>FÉ • FAMÍLIA • CARÁTER</span>
      </footer>

      {/* Modal de configurações (sem notificações) */}
      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="section-kicker">PREFERÊNCIAS</span>
                <h2>Configurações</h2>
              </div>
              <button className="icon-btn" onClick={() => setShowSettings(false)}>
                <X size={19} />
              </button>
            </div>

            <div className="setting-row reset-row">
              <div className="setting-icon">
                <RotateCcw size={18} />
              </div>
              <div className="setting-copy">
                <strong>Reiniciar progresso</strong>
                <small>Apaga as marcações salvas neste navegador.</small>
              </div>
              <button className="text-danger" onClick={resetProgress}>
                Apagar
              </button>
            </div>

            <p className="privacy-note">
              Seus dados ficam somente neste navegador. Limpar os dados do navegador pode
              apagar o progresso.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
