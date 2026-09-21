import React, { useEffect } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Download,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SessionReport, PracticeScenario, LanguageOption } from '../types';

interface SessionSummaryModalProps {
  report: SessionReport;
  scenario: PracticeScenario;
  language: LanguageOption;
  onClose: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  report,
  scenario,
  language,
  onClose,
}) => {
  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#818cf8', '#34d399', '#f59e0b', '#ec4899'],
      });
    } catch (e) {}
  }, []);

  const handleDownloadReport = () => {
    const content = `LingoLive Practice Report - ${language.name}
Scenario: ${scenario.title}
Date: ${new Date().toLocaleDateString()}
Fluency Score: ${report.overallScore}/100

Key Strengths:
${report.strengths.map((s) => `• ${s}`).join('\n')}

Areas to Improve:
${report.areasToImprove.map((a) => `• ${a}`).join('\n')}

Grammar & Phrasing Highlights:
${report.grammarHighlights.map((g) => `Original: "${g.original}" -> Better: "${g.better}" (${g.rule})`).join('\n')}

Key Vocabulary:
${report.keyVocabularyLearned.map((v) => `• ${v.term}: ${v.meaning}`).join('\n')}

Coach's Note:
${report.motivationalComment}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingolive-${language.id}-session.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card-neon bg-[#140528]/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_20px_60px_rgba(236,72,153,0.3)] border border-pink-500/30 text-white animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-pink-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(236,72,153,0.35)]">
              <div className="w-full h-full rounded-2xl bg-[#140528] flex items-center justify-center text-pink-300">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Session Review & Fluency Report</h3>
              <p className="text-xs text-slate-300">
                {language.flag} {language.name} • {scenario.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fluency Score Card */}
        <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-pink-500/25 via-rose-500/20 to-purple-600/25 backdrop-blur-xl border border-pink-500/30 shadow-[0_0_25px_rgba(236,72,153,0.25)] text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-300">Communicative Score</span>
            <div className="text-3xl font-black mt-0.5 text-white">{report.overallScore} / 100</div>
            <p className="text-xs text-pink-200/90 mt-1 max-w-sm">
              {report.overallScore >= 85
                ? 'Outstanding fluidity and expressive command!'
                : report.overallScore >= 70
                ? 'Solid communicative flow with great vocabulary usage.'
                : 'Good foundation and conversational persistence!'}
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-pink-400/30 shadow-inner">
            <Sparkles className="w-8 h-8 text-pink-300 animate-pulse" />
          </div>
        </div>

        <div className="mt-6 space-y-5">
          
          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Key Strengths</span>
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-200">
                {report.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Areas to Polish</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-200">
                {report.areasToImprove.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Grammar & Phrasing Highlights */}
          {report.grammarHighlights && report.grammarHighlights.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Grammar & Expression Polish
              </div>
              <div className="space-y-2">
                {report.grammarHighlights.map((g, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                    <div className="flex items-center gap-2 text-slate-400 line-through">
                      "{g.original}"
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-pink-300 mt-1">
                      <ArrowRight className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      "{g.better}"
                    </div>
                    <div className="text-slate-400 text-[11px] mt-1 pl-5">{g.rule}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Vocabulary Learned */}
          {report.keyVocabularyLearned && report.keyVocabularyLearned.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Vocabulary Introduced in Session
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.keyVocabularyLearned.map((v, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                    <span className="font-bold text-white">{v.term}</span>
                    <span className="text-slate-400 ml-1.5">— {v.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Motivational Comment */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 italic leading-relaxed">
            "{report.motivationalComment}"
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-pink-500/20 flex items-center justify-between">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Notes</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all cursor-pointer"
          >
            Continue Practicing
          </button>
        </div>

      </div>
    </div>
  );
};
