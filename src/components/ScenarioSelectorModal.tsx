import React, { useState } from 'react';
import {
  BookOpen,
  Coffee,
  Utensils,
  Hotel,
  Compass,
  Briefcase,
  ShoppingBag,
  HeartPulse,
  Sparkles,
  X,
  CheckCircle2,
  Search,
  Dices,
  Loader2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { PracticeScenario, LanguageOption, ProficiencyLevel } from '../types';
import { PRACTICE_SCENARIOS } from '../data/languages';

interface ScenarioSelectorModalProps {
  currentScenario: PracticeScenario;
  currentLanguage?: LanguageOption;
  proficiencyLevel?: ProficiencyLevel;
  onSelectScenario: (scenario: PracticeScenario) => void;
  onClose: () => void;
}

const CATEGORIES = [
  'All',
  'A0/A1 Foundations',
  'Dining',
  'Travel',
  'Social',
  'Career',
  'Daily Life',
  'Housing',
  'Healthcare',
  'Culture',
  'Advanced',
] as const;

export const ScenarioSelectorModal: React.FC<ScenarioSelectorModalProps> = ({
  currentScenario,
  currentLanguage,
  proficiencyLevel = 'A0 - Absolute Beginner (Zero Knowledge)' as ProficiencyLevel,
  onSelectScenario,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Dynamic user-generated scenarios stored in memory during the session
  const [dynamicScenarios, setDynamicScenarios] = useState<PracticeScenario[]>([]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'Hotel':
        return <Hotel className="w-5 h-5 text-cyan-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-emerald-400" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-purple-400" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-rose-400" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-red-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-pink-400" />;
      default:
        return <Coffee className="w-5 h-5 text-pink-300" />;
    }
  };

  const allCombinedScenarios = [...dynamicScenarios, ...PRACTICE_SCENARIOS];

  const filteredScenarios = allCombinedScenarios.filter((scenario) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'A0/A1 Foundations'
        ? scenario.difficulty.includes('A0') || scenario.difficulty.includes('A1')
        : scenario.category === selectedCategory;

    const matchesSearch =
      !searchQuery.trim() ||
      scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.difficulty.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Call AI Backend to Generate any scenario imaginable on demand
  const handleGenerateAIScenario = async (promptTopic?: string) => {
    const topicToUse = (promptTopic || customTopic).trim();
    if (!topicToUse && !promptTopic) return;

    setIsGeneratingAI(true);
    setGenerationError(null);

    try {
      const res = await fetch('/api/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse || 'Immersive city dialogue',
          category: selectedCategory !== 'All' ? selectedCategory : 'Social',
          targetLanguage: currentLanguage?.name || 'French',
          nativeLanguage: 'English',
          proficiencyLevel,
        }),
      });

      const data = await res.json();
      if (data.success && data.scenario) {
        const newScenario: PracticeScenario = {
          ...data.scenario,
          id: data.scenario.id || `ai-${Date.now()}`,
        };
        setDynamicScenarios((prev) => [newScenario, ...prev]);
        onSelectScenario(newScenario);
        onClose();
      } else {
        throw new Error(data.message || 'Failed to generate scenario.');
      }
    } catch (err: any) {
      console.error('Failed to generate AI scenario:', err);
      // Fallback local creation so user is never blocked
      const fallback: PracticeScenario = {
        id: `ai-custom-${Date.now()}`,
        title: topicToUse || 'Custom Exploration Scenario',
        icon: 'Sparkles',
        category: 'Social',
        description: customDescription.trim() || `Situational conversation practice about ${topicToUse}.`,
        difficulty: proficiencyLevel,
        initialPrompt: `Roleplay an authentic conversation about: ${topicToUse} in ${currentLanguage?.name || 'the target language'}. Ask engaging questions calibrated to ${proficiencyLevel}.`,
        goals: [
          { id: 'cg1', description: `Discuss key aspects of ${topicToUse}`, completed: false },
          { id: 'cg2', description: 'Ask a thoughtful question in the target language', completed: false },
          { id: 'cg3', description: 'Practice 2 relevant vocabulary expressions', completed: false },
        ],
        suggestedStarters: [
          `Let's talk about ${topicToUse}`,
          'Can you tell me more about this?',
          'What is the most natural way to say this?',
        ],
      };
      setDynamicScenarios((prev) => [fallback, ...prev]);
      onSelectScenario(fallback);
      onClose();
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const sampleQuickTopics = [
    'Ordering ramen & specifying broth in Tokyo',
    'Apartment lease negotiation in Paris',
    'Tech startup funding pitch in Berlin',
    'Artisanal coffee cupping & tasting notes',
    'Emergency dental visit with toothache',
    'Booking a high-speed train window seat',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="glass-card-neon bg-[#140528]/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-[0_20px_60px_rgba(236,72,153,0.3)] border border-pink-500/30 text-white animate-in zoom-in-95 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-pink-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(236,72,153,0.4)]">
              <div className="w-full h-full rounded-2xl bg-[#140528] flex items-center justify-center text-pink-300">
                <Sparkles className="w-5 h-5 text-pink-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base sm:text-lg text-white tracking-wide">
                  Practice Scenarios Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500/25 text-pink-300 border border-pink-400/40 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                  {allCombinedScenarios.length} Scenarios + Infinite AI
                </span>
                {currentLanguage && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10">
                    {currentLanguage.flag} {currentLanguage.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Immerse yourself in authentic real-life dialogues calibrated to your CEFR level
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Quick AI Action Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across bakery, trains, interviews, hospital, café..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.04] text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500/60"
            />
          </div>

          {/* Random Surprise Me AI Button */}
          <button
            onClick={() => handleGenerateAIScenario()}
            disabled={isGeneratingAI}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 border border-pink-500/40 text-xs font-bold text-pink-200 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
            title="Generate a fresh, unique scenario via AI"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
                <span>Generating AI Scenario...</span>
              </>
            ) : (
              <>
                <Dices className="w-3.5 h-3.5 text-pink-300" />
                <span>Surprise Me (AI)</span>
              </>
            )}
          </button>

          {/* Custom Scenario Builder Toggle */}
          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
              isCustomMode
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-pink-300 border-pink-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isCustomMode ? 'Browse Catalog' : '+ Create Topic'}</span>
          </button>
        </div>

        {/* Category Filter Pills (Hidden in Custom Creator Mode) */}
        {!isCustomMode && (
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                    : 'bg-white/[0.05] hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Body: Either Custom Creator OR Scenarios Grid */}
        <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-1">
          {isCustomMode ? (
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-pink-500/30 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-300 border border-pink-400/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Generate Any Custom Scenario</h4>
                  <p className="text-xs text-slate-400">
                    Type any situation or choose a quick prompt to instantly generate CEFR goals, dialogue context, and starters.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-pink-200 block mb-1">
                  Topic / Situation (in English or target language):
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Asking the butcher for lean cuts, Discussing film photography, Negotiating rent"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 text-xs bg-white/[0.05] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500"
                />
              </div>

              {/* Quick Prompt Ideas */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Quick AI Inspiration Ideas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleQuickTopics.map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleGenerateAIScenario(topic)}
                      disabled={isGeneratingAI}
                      className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-pink-500/20 border border-white/10 hover:border-pink-400/40 text-[11px] text-slate-300 hover:text-white transition-all text-left cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{topic}</span>
                      <ArrowRight className="w-3 h-3 text-pink-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Additional Context (Optional):
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Optional details: persona tone, specific vocabulary to include, or difficulty nuances..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-white/15 text-xs bg-white/[0.05] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500"
                />
              </div>

              {generationError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">
                  {generationError}
                </div>
              )}

              <button
                onClick={() => handleGenerateAIScenario()}
                disabled={!customTopic.trim() || isGeneratingAI}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing CEFR Goals & Starters...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Generate & Launch Practice Scenario</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Scenarios Grid with Vibrant Pinkish Glass Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
              {filteredScenarios.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <BookOpen className="w-10 h-10 text-pink-300/40 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">No scenarios match &quot;{searchQuery}&quot;</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click &quot;+ Create Topic&quot; or &quot;Surprise Me&quot; to generate an AI scenario for this!
                  </p>
                  <button
                    onClick={() => handleGenerateAIScenario(searchQuery)}
                    className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate &quot;{searchQuery}&quot; with AI</span>
                  </button>
                </div>
              ) : (
                filteredScenarios.map((scenario) => {
                  const isSelected = scenario.id === currentScenario.id;
                  return (
                    <div
                      key={scenario.id}
                      onClick={() => {
                        onSelectScenario(scenario);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-pink-500/20 border-pink-400 ring-2 ring-pink-400/40 shadow-[0_0_20px_rgba(236,72,153,0.35)]'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-pink-500/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                              {getIcon(scenario.icon)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{scenario.title}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-semibold text-pink-300">{scenario.category}</span>
                                {scenario.id.startsWith('ai-') && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
                                    AI Generated
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />}
                        </div>

                        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed line-clamp-2">
                          {scenario.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 font-semibold text-[10px]">
                          {scenario.difficulty.split(' - ')[0]}
                        </span>
                        <span className="font-bold text-pink-300 text-[11px]">
                          {scenario.goals.length} Practice Goals
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
