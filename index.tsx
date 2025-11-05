
import React, { useState, useEffect, useCallback, useMemo, memo, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

      // --- Game Configuration ---
      const LEVEL_CONFIG = {
          1: { scoreToPass: 10, interval: 1000, duration: 25 },
          2: { scoreToPass: 15, interval: 850, duration: 25 },
          3: { scoreToPass: 20, interval: 700, duration: 20 },
          4: { scoreToPass: 25, interval: 550, duration: 20 },
          5: { scoreToPass: 30, interval: 400, duration: 15 },
      };
      const MAX_LEVEL = Object.keys(LEVEL_CONFIG).length;

      const DIFFICULTY_MODIFIERS = {
        '쉬움': { interval: 1.2, score: 0.8 },
        '보통': { interval: 1.0, score: 1.0 },
        '어려움': { interval: 0.8, score: 1.2 },
      };

      const GAME_LENGTH_MODIFIERS = {
        '짧게': { duration: 0.7, score: 0.8 },
        '보통': { duration: 1.0, score: 1.0 },
        '길게': { duration: 1.5, score: 1.4 },
      };
      
      const FEVER_COMBO_THRESHOLD = 10;
      const FEVER_DURATION_SECONDS = 7;

      const JOB_CONFIG = {
          '농부': { name: '농부', description: '두더지 10마리마다 +2 보너스 점수', icon: '👨‍🌾' },
          '광부': { name: '광부', description: '폭탄 패널티 감소 (-1점)', icon: '⛏️' },
          '시간 여행자': { name: '시간 여행자', description: '5초간 게임 속도 50% 감소 (쿨타임 20초)', icon: '⏳' },
          '엔지니어': { name: '엔지니어', description: '시계가 +3초를 부여하고, 레벨 시작 시 +5초를 얻습니다.', icon: '⚙️' },
          '점성술사': { name: '점성술사', description: '가끔씩 다음 두더지 위치를 미리 알려줍니다.', icon: '✨' },
          '도박사': { name: '도박사', description: '타격 시 10% 확률로 점수 2배, 5% 확률로 0점', icon: '🎲' },
          '수집가': { name: '수집가', description: '게임 종료 시 획득 골드 20% 증가', icon: '💰' },
          '보석상': { name: '보석상', description: '희귀 두더지(황금, 요정 등) 등장 확률이 증가합니다.', icon: '💎' },
          '요리사': { name: '요리사', description: '시계 아이템 획득 시 +1점을 추가로 얻습니다.', icon: '👨‍🍳' },
          '폭탄 전문가': { name: '폭탄 전문가', description: '폭탄을 성공적으로 해체하면 패널티 대신 +5점을 얻습니다.', icon: '💣' },
          '자연주의자': { name: '자연주의자', description: '게임 시작 시 두더지 미끼 1개를 가지고 시작합니다.', icon: '🌿' },
          '대장장이': { name: '대장장이', description: '영구 강화 업그레이드 비용이 10% 감소합니다.', icon: '🛠️' },
          '사냥꾼': { name: '사냥꾼', description: '두더지를 놓치지 않고 5번 연속으로 잡으면 콤보 보너스 +5점.', icon: '🎯' },
          '은행가': { name: '은행가', description: '게임 시작 시 현재 보유 골드의 1%를 보너스로 받습니다 (최대 50골드).', icon: '🏦' },
          '마법사': { name: '마법사', description: '가끔씩 폭탄을 점수를 주는 보석으로 바꿉니다.', icon: '🧙' },
          '의사': { name: '의사', description: '폭탄으로 인한 점수 감소 패널티가 50% 줄어듭니다.', icon: '👨‍⚕️' },
          '연금술사': { name: '연금술사', description: '두더지를 잡을 때마다 15% 확률로 1골드를 추가로 얻습니다.', icon: '⚗️' },
          '음악가': { name: '음악가', description: '모든 버프의 지속 시간이 20% 증가합니다.', icon: '🎵' },
          '탐험가': { name: '탐험가', description: '게임판 크기가 4x4 이상일 때 시작 시 +5초를 얻습니다.', icon: '🧭' },
          '닌자': { name: '닌자', description: '두더지 등장/사라지는 속도 15% 증가, 두더지 기본 점수 +1.', icon: '🥷' },
          '유령': { name: '유령', description: '폭탄을 쳐도 25% 확률로 패널티를 무시합니다.', icon: '👻' },
      };
      
      const PET_CONFIG = {
        'golden_mole': { name: '황금 두더지', icon: '🌟', description: '즉시 10골드 획득 및 5초간 점수 2배' },
        'fairy_mole': { name: '요정 두더지', icon: '🧚', description: '즉시 5초 추가 및 10초간 두더지 등장 빈도 증가' },
        'lucky_clover': { name: '행운 클로버 두더지', icon: '🍀', description: '때때로 약간의 골드를 획득합니다 (1-5 G).' },
        'tank_mole': { name: '튼튼 두더지', icon: '🛡️', description: '두 번 때려야 잡을 수 있습니다! (+3점, +2골드)' },
        'gem_mole': { name: '보석 두더지', icon: '💎', description: '잡으면 +3점을 줍니다.' },
        'mystery_box_mole': { name: '미스터리 박스 두더지', icon: '🎁', description: '무엇이 나올지 모르는 상자입니다. 행운을 빌어요!' },
        'thief_mole': { name: '도둑 두더지', icon: '👺', description: '골드를 훔칩니다! 잡아서 2배로 돌려받으세요!' },
        'king_mole': { name: '두더지 왕', icon: '👑', description: '세 번 때려야 합니다! 엄청난 보상을 줍니다! (+10점, +15골드)' },
        'joker_mole': { name: '광대 두더지', icon: '🃏', description: '예측할 수 없는 효과를 일으킵니다!' },
      };

      const SHOP_ITEMS = {
        powerups: [
          { id: 'mole_bait', name: '두더지 미끼', description: '5초간 두더지만 나타나게 합니다.', price: 50, icon: '🍖' },
          { id: 'bomb_defusal_kit', name: '폭탄 해체 키트', description: '다음 폭탄 1개를 무효화합니다.', price: 75, icon: '🔧' }
        ],
        upgrades: [
          { id: 'mole_score', name: '강화된 망치', description: '두더지 기본 점수를 1점 증가시킵니다.', price: 200, icon: '🔨', maxLevel: 5 },
          { id: 'clock_time', name: '정밀 시계', description: '시계 아이템의 시간 증가량을 1초 늘립니다.', price: 250, icon: '⏱️', maxLevel: 5 },
          { id: 'gold_bonus', name: '골드 탐지기', description: '게임 종료 시 획득하는 골드가 5% 증가합니다.', price: 400, icon: '🪙', maxLevel: 10 },
        ],
        jobs: [
          { id: '엔지니어', name: '엔지니어', description: JOB_CONFIG['엔지니어'].description, price: 500, icon: '⚙️' },
          { id: '점성술사', name: '점성술사', description: JOB_CONFIG['점성술사'].description, price: 750, icon: '✨' },
          { id: '도박사', name: '도박사', description: JOB_CONFIG['도박사'].description, price: 600, icon: '🎲' },
          { id: '수집가', name: '수집가', description: JOB_CONFIG['수집가'].description, price: 600, icon: '💰' },
          { id: '보석상', name: '보석상', description: JOB_CONFIG['보석상'].description, price: 800, icon: '💎' },
          { id: '요리사', name: '요리사', description: JOB_CONFIG['요리사'].description, price: 400, icon: '👨‍🍳' },
          { id: '폭탄 전문가', name: '폭탄 전문가', description: JOB_CONFIG['폭탄 전문가'].description, price: 1000, icon: '💣' },
          { id: '자연주의자', name: '자연주의자', description: JOB_CONFIG['자연주의자'].description, price: 550, icon: '🌿' },
          { id: '대장장이', name: '대장장이', description: JOB_CONFIG['대장장이'].description, price: 1200, icon: '🛠️' },
          { id: '사냥꾼', name: '사냥꾼', description: JOB_CONFIG['사냥꾼'].description, price: 900, icon: '🎯' },
          { id: '은행가', name: '은행가', description: JOB_CONFIG['은행가'].description, price: 1500, icon: '🏦' },
          { id: '마법사', name: '마법사', description: JOB_CONFIG['마법사'].description, price: 1300, icon: '🧙' },
          { id: '의사', name: '의사', description: JOB_CONFIG['의사'].description, price: 700, icon: '👨‍⚕️' },
          { id: '연금술사', name: '연금술사', description: JOB_CONFIG['연금술사'].description, price: 1100, icon: '⚗️' },
          { id: '음악가', name: '음악가', description: JOB_CONFIG['음악가'].description, price: 850, icon: '🎵' },
          { id: '탐험가', name: '탐험가', description: JOB_CONFIG['탐험가'].description, price: 650, icon: '🧭' },
          { id: '닌자', name: '닌자', description: JOB_CONFIG['닌자'].description, price: 1400, icon: '🥷' },
          { id: '유령', name: '유령', description: JOB_CONFIG['유령'].description, price: 950, icon: '👻' },
        ]
      };

      const BOMB_PROBABILITY = 0.08;
      const ITEM_PROBABILITY = 0.10;
      const PET_PROBABILITY = 0.05;
      const CURSED_MOLE_PROBABILITY = 0.04;
      const THIEF_MOLE_PROBABILITY = 0.04;
      const KING_MOLE_PROBABILITY = 0.01;
      const JOKER_MOLE_PROBABILITY = 0.04;


      // --- Type Definitions ---
      type EntityType = 'empty' | 'mole' | 'bomb' | 'clock' | 'pet' | 'cursed_mole';
      type PetSubType = keyof typeof PET_CONFIG;
      type Difficulty = keyof typeof DIFFICULTY_MODIFIERS;
      type GameLength = keyof typeof GAME_LENGTH_MODIFIERS;
      type Job = keyof typeof JOB_CONFIG;
      type GameState = 'idle' | 'playing' | 'paused' | 'levelComplete' | 'gameOver' | 'gameComplete';
      type ShopPowerupId = 'mole_bait' | 'bomb_defusal_kit';
      type UpgradeId = 'mole_score' | 'clock_time' | 'gold_bonus';
      type LevelEvent = 'mole_frenzy' | 'bomb_scare' | 'gold_rush' | 'tank_outbreak' | null;

      type Entity = {
          type: EntityType;
          subType?: PetSubType;
          hits?: number;
          stolenGold?: number;
      };

      type VisibilityProps = {
          isVisible: boolean;
      };

      type HoleProps = {
          entity: Entity;
          onWhack: (e: React.MouseEvent) => void;
          canWhack: boolean;
          isHinted: boolean;
      };

      type Buff = {
          expiresAt: number;
          [key: string]: any;
      };

      // --- SVG Icons ---
      const HammerIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> );
      const TimerIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
      const GoldIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>);
      
      const BombIcon = ({ isVisible }: VisibilityProps) => ( <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}><div className="absolute inset-0 bg-gray-800 rounded-full border-4 border-black flex justify-center items-start"><div className="w-2 h-4 bg-gray-500 rounded-t-sm"></div></div></div> );
      const ClockIcon = ({ isVisible }: VisibilityProps) => ( <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}><div className="absolute inset-0 bg-blue-400 rounded-full border-4 border-blue-800 flex justify-center items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-2/3 w-2/3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div></div> );
      const GoldenMole = memo(({ isVisible }: VisibilityProps) => ( <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}><div className="absolute inset-0 bg-yellow-400 rounded-full border-4 border-yellow-600 animate-pulse"><div className="absolute top-1/4 left-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/4 right-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/5 bg-pink-300 rounded-t-full rounded-b-sm"></div><div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">🌟</div></div></div> ));
      const FairyMole = memo(({ isVisible }: VisibilityProps) => ( <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}><div className="absolute inset-0 bg-pink-300 rounded-full border-4 border-pink-500"><div className="absolute top-1/4 left-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/4 right-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/5 bg-white rounded-t-full rounded-b-sm"></div><div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 text-xl rotate-[-30deg]">🧚</div></div></div> ));
      const LuckyClover = memo(({ isVisible }: VisibilityProps) => ( <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}><div className="absolute inset-0 bg-green-600 rounded-full border-4 border-green-800"><div className="absolute top-1/4 left-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/4 right-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/5 bg-pink-300 rounded-t-full rounded-b-sm"></div><div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">🍀</div></div></div> ));
      const GemMole = memo(({ isVisible }: VisibilityProps) => ( <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}><div className="absolute inset-0 bg-cyan-400 rounded-full border-4 border-cyan-600 animate-pulse"><div className="absolute top-1/4 left-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/4 right-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/5 bg-white rounded-t-full rounded-b-sm"></div><div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">💎</div></div></div> ));
      const CursedMole = memo(({ isVisible }: VisibilityProps) => ( <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}><div className="absolute inset-0 bg-purple-700 rounded-full border-4 border-purple-900"><div className="absolute top-1/4 left-[20%] w-1/6 h-1/4 bg-red-500 rounded-full"></div><div className="absolute top-1/4 right-[20%] w-1/6 h-1/4 bg-red-500 rounded-full"></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/5 bg-black rounded-t-sm rounded-b-full"></div><div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">💀</div></div></div> ));
      const TankMole = memo(({ isVisible, hits }: { isVisible: boolean, hits?: number }) => (
        <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="absolute inset-0 bg-slate-500 rounded-full border-4 border-slate-700">
            <div className="absolute top-1/4 left-[20%] w-1/6 h-1/4 bg-black rounded-full"></div>
            <div className="absolute top-1/4 right-[20%] w-1/6 h-1/4 bg-black rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/5 bg-pink-300 rounded-t-full rounded-b-sm"></div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">🛡️</div>
            {hits === 1 && (
              <div className="absolute inset-0 flex items-center justify-center opacity-70">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                  <path d="M 25 35 L 75 65 M 40 75 L 60 25 M 20 60 L 80 40" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
        </div>
      ));
      const MysteryBoxMole = memo(({ isVisible }: VisibilityProps) => ( <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}><div className="absolute inset-0 bg-amber-700 rounded-full border-4 border-black/80"><div className="absolute top-1/4 left-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/4 right-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/5 bg-pink-300 rounded-t-full rounded-b-sm"></div><div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl">🎁</div></div></div> ));
      const ThiefMole = memo(({ isVisible, stolenGold }: { isVisible: boolean, stolenGold?: number }) => (
        <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="absolute inset-0 bg-gray-600 rounded-full border-4 border-gray-800">
                <div className="absolute top-1/4 left-0 right-0 h-1/4 bg-black"></div>
                <div className="absolute top-[30%] left-[20%] w-1/6 h-1/6 bg-white rounded-full"></div>
                <div className="absolute top-[30%] right-[20%] w-1/6 h-1/6 bg-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/5 bg-pink-300 rounded-t-full rounded-b-sm"></div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">👺</div>
                {stolenGold && (
                    <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
                        -{stolenGold}G
                    </div>
                )}
            </div>
        </div>
    ));
    const KingMole = memo(({ isVisible, hits }: { isVisible: boolean, hits?: number }) => (
        <div className={`relative w-[95%] h-[95%] transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="absolute inset-0 bg-purple-600 rounded-full border-4 border-yellow-400">
                <div className="absolute top-1/4 left-[20%] w-1/6 h-1/4 bg-white rounded-full border-2 border-black"><div className="w-1/2 h-1/2 bg-black rounded-full mx-auto my-auto"></div></div>
                <div className="absolute top-1/4 right-[20%] w-1/6 h-1/4 bg-white rounded-full border-2 border-black"><div className="w-1/2 h-1/2 bg-black rounded-full mx-auto my-auto"></div></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/5 bg-pink-300 rounded-t-full rounded-b-sm"></div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl">👑</div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`text-xl ${i < (hits ?? 3) ? 'text-red-500' : 'text-gray-500'}`}>♥</span>
                    ))}
                </div>
            </div>
        </div>
    ));
    const JokerMole = memo(({ isVisible }: VisibilityProps) => (
        <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-yellow-300 to-blue-500 rounded-full border-4 border-purple-600">
                <div className="absolute top-1/4 left-[20%] w-1/6 h-1/4 bg-black rounded-full"></div>
                <div className="absolute top-1/4 right-[20%] w-1/6 h-1/4 bg-black rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/5 bg-white rounded-t-full rounded-b-sm"></div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl">🃏</div>
            </div>
        </div>
    ));

      // --- Child Components ---
      const Mole = memo(({ isVisible }: VisibilityProps) => ( <div className={`relative w-4/5 h-4/5 transition-transform duration-100 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}><div className="absolute inset-0 bg-amber-700 rounded-full border-4 border-black/80"><div className="absolute top-1/4 left-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/4 right-[20%] w-1/6 h-1/4 bg-black rounded-full"></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/5 bg-pink-300 rounded-t-full rounded-b-sm"></div></div></div> ));
      const Hole = memo(({ entity, onWhack, canWhack, isHinted }: HoleProps) => {
          const isVisible = entity.type !== 'empty';
          const renderEntity = () => {
              switch (entity.type) {
                  case 'mole': return <Mole isVisible={isVisible} />;
                  case 'bomb': return <BombIcon isVisible={isVisible} />;
                  case 'clock': return <ClockIcon isVisible={isVisible} />;
                  case 'cursed_mole': return <CursedMole isVisible={isVisible} />;
                  case 'pet':
                      switch(entity.subType) {
                          case 'golden_mole': return <GoldenMole isVisible={isVisible} />;
                          case 'fairy_mole': return <FairyMole isVisible={isVisible} />;
                          case 'lucky_clover': return <LuckyClover isVisible={isVisible} />;
                          case 'tank_mole': return <TankMole isVisible={isVisible} hits={entity.hits} />;
                          case 'gem_mole': return <GemMole isVisible={isVisible} />;
                          case 'mystery_box_mole': return <MysteryBoxMole isVisible={isVisible} />;
                          case 'thief_mole': return <ThiefMole isVisible={isVisible} stolenGold={entity.stolenGold} />;
                          case 'king_mole': return <KingMole isVisible={isVisible} hits={entity.hits} />;
                          case 'joker_mole': return <JokerMole isVisible={isVisible} />;
                          default: return null;
                      }
                  default: return null;
              }
          };
          return ( <div className={`w-full h-full bg-yellow-900/60 rounded-full overflow-hidden flex items-end justify-center pt-4 shadow-inner relative transition-shadow ${isHinted ? 'ring-4 ring-purple-400 ring-opacity-75 animate-pulse' : ''}`} onClick={canWhack && isVisible ? onWhack : undefined}>{renderEntity()}</div> );
      });

      const ShopModal = ({ isOpen, onClose, gold, powerups, unlockedJobs, upgrades, setGold, setPowerups, setUnlockedJobs, setUpgrades, job }: { isOpen: boolean, onClose: () => void, gold: number, powerups: Record<ShopPowerupId, number>, unlockedJobs: Job[], upgrades: Record<UpgradeId, number>, setGold: React.Dispatch<React.SetStateAction<number>>, setPowerups: React.Dispatch<React.SetStateAction<Record<ShopPowerupId, number>>>, setUnlockedJobs: React.Dispatch<React.SetStateAction<Job[]>>, setUpgrades: React.Dispatch<React.SetStateAction<Record<UpgradeId, number>>>, job: Job }) => {
        if (!isOpen) return null;

        const handlePurchase = (item: any, type: 'powerup' | 'upgrade' | 'job') => {
          let price = item.price;
          if (type === 'upgrade') {
            const currentLevel = upgrades[item.id as UpgradeId] || 0;
            price = Math.round(item.price * (1 + currentLevel * 0.5));
            if (job === '대장장이' && unlockedJobs.includes('대장장이')) {
              price = Math.round(price * 0.9);
            }
            if (gold >= price && currentLevel < item.maxLevel) {
              setGold(prev => prev - price);
              setUpgrades(prev => ({ ...prev, [item.id]: (prev[item.id as UpgradeId] || 0) + 1 }));
            }
          } else if (gold >= price) {
            setGold(prev => prev - price);
            if(type === 'powerup') {
              setPowerups(prev => ({ ...prev, [item.id]: (prev[item.id as ShopPowerupId] || 0) + 1 }));
            } else if(type === 'job') {
              setUnlockedJobs(prev => [...prev, item.id as Job]);
            }
          }
        };

        const renderItem = (item: any, type: 'powerup' | 'upgrade' | 'job') => {
          let name = item.name;
          let description = item.description;
          let price = item.price;
          let ownedStatus;
          let isAffordable = gold >= price;
          let isDisabled = false;

          if (type === 'powerup') {
            ownedStatus = `(보유: ${powerups[item.id as ShopPowerupId] || 0})`;
          } else if (type === 'job') {
            if (unlockedJobs.includes(item.id)) {
              isDisabled = true;
              ownedStatus = '보유중';
            }
          } else if (type === 'upgrade') {
            const currentLevel = upgrades[item.id as UpgradeId] || 0;
            price = Math.round(item.price * (1 + currentLevel * 0.5));
            if (job === '대장장이' && unlockedJobs.includes('대장장이')) {
              price = Math.round(price * 0.9);
            }
            isAffordable = gold >= price;
            if (currentLevel >= item.maxLevel) {
              isDisabled = true;
              ownedStatus = '최대 레벨';
            } else {
              ownedStatus = `(Lv. ${currentLevel} / ${item.maxLevel})`;
            }
          }

          isDisabled = isDisabled || !isAffordable;

          return (
            <div key={`${type}-${item.id}`} className="flex items-center justify-between p-3 bg-amber-200/50 rounded-lg">
              <div className="flex items-center">
                <div className="text-3xl mr-4">{item.icon}</div>
                <div>
                  <h4 className="font-bold">{name} <span className="text-sm font-normal text-amber-700">{ownedStatus}</span></h4>
                  <p className="text-xs text-amber-800">{description}</p>
                </div>
              </div>
              <button 
                onClick={() => handlePurchase(item, type)}
                disabled={isDisabled}
                className={`w-28 text-center px-4 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-transform transform hover:scale-105
                  ${isDisabled && ownedStatus !== '보유중' && ownedStatus !== '최대 레벨' ? 'bg-red-400 cursor-not-allowed' : 
                   ownedStatus === '보유중' || ownedStatus === '최대 레벨' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {ownedStatus === '보유중' || ownedStatus === '최대 레벨' ? ownedStatus : `${price} G`}
              </button>
            </div>
          );
        };
        
        return (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-amber-100 rounded-2xl shadow-xl border-4 border-amber-500 p-6 flex flex-col">
              <header className="flex justify-between items-center mb-4 pb-2 border-b-2 border-amber-300">
                <h2 className="text-3xl font-bold">상점</h2>
                <div className="px-4 py-2 bg-yellow-400/80 rounded-lg font-bold text-amber-900 flex items-center shadow-inner">
                  <GoldIcon /> {gold} G
                </div>
                <button onClick={onClose} className="text-3xl font-bold hover:text-red-500 transition-colors">&times;</button>
              </header>
              <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
                <section>
                  <h3 className="text-xl font-semibold mb-2 text-amber-800">영구 강화</h3>
                  <div className="space-y-2">{SHOP_ITEMS.upgrades.map(item => renderItem(item, 'upgrade'))}</div>
                </section>
                <section>
                  <h3 className="text-xl font-semibold mb-2 text-amber-800">파워업</h3>
                  <div className="space-y-2">{SHOP_ITEMS.powerups.map(item => renderItem(item, 'powerup'))}</div>
                </section>
                <section>
                  <h3 className="text-xl font-semibold mb-2 text-amber-800">직업 해금</h3>
                  <div className="space-y-2">{SHOP_ITEMS.jobs.map(item => renderItem(item, 'job'))}</div>
                </section>
              </div>
            </div>
          </div>
        )
      };

      // --- Main App Component ---
      function App() {
        const [gameState, setGameState] = useState<GameState>('idle');
        const [score, setScore] = useState(0);
        const [earnedGoldInRun, setEarnedGoldInRun] = useState(0);
        const [level, setLevel] = useState(1);
        const [difficulty, setDifficulty] = useState<Difficulty>('보통');
        const [gameLength, setGameLength] = useState<GameLength>('보통');
        const [gridSize, setGridSize] = useState(9);
        const [entities, setEntities] = useState<Entity[]>(new Array(gridSize).fill({type: 'empty'}));
        const [job, setJob] = useState<Job>('농부');
        const [isShopOpen, setIsShopOpen] = useState(false);
        
        const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('whac-a-mole-highscore') || 0));
        const [gold, setGold] = useState(() => Number(localStorage.getItem('whac-a-mole-gold') || 0));
        const [powerups, setPowerups] = useState<Record<ShopPowerupId, number>>(() => JSON.parse(localStorage.getItem('whac-a-mole-powerups') || '{}'));
        const [unlockedJobs, setUnlockedJobs] = useState<Job[]>(() => JSON.parse(localStorage.getItem('whac-a-mole-unlockedJobs') || '["농부", "광부", "시간 여행자"]'));
        const [upgrades, setUpgrades] = useState<Record<UpgradeId, number>>(() => JSON.parse(localStorage.getItem('whac-a-mole-upgrades') || '{"mole_score": 0, "clock_time": 0, "gold_bonus": 0}'));
        
        useEffect(() => { localStorage.setItem('whac-a-mole-gold', gold.toString()); }, [gold]);
        useEffect(() => { localStorage.setItem('whac-a-mole-powerups', JSON.stringify(powerups)); }, [powerups]);
        useEffect(() => { localStorage.setItem('whac-a-mole-unlockedJobs', JSON.stringify(unlockedJobs)); }, [unlockedJobs]);
        useEffect(() => { localStorage.setItem('whac-a-mole-upgrades', JSON.stringify(upgrades)); }, [upgrades]);

        const [molesWhacked, setMolesWhacked] = useState(0);
        const [combo, setCombo] = useState(0);
        const [isSkillActive, setIsSkillActive] = useState(false);
        const [skillCooldown, setSkillCooldown] = useState(0);
        const [scorePulse, setScorePulse] = useState(false);
        const [isMoleBaitActive, setIsMoleBaitActive] = useState(false);
        const [nextMoleHint, setNextMoleHint] = useState<number | null>(null);
        const [activeBuffs, setActiveBuffs] = useState<Record<string, Buff>>({});
        const [buffTimers, setBuffTimers] = useState<Record<string, number>>({});
        const [feverActivationMessage, setFeverActivationMessage] = useState(false);
        const [levelEvent, setLevelEvent] = useState<LevelEvent>(null);
        const [eventMessage, setEventMessage] = useState<string | null>(null);
        const [displayMessage, setDisplayMessage] = useState<{ message: string; isGood: boolean } | null>(null);

        const gridDimension = useMemo(() => Math.sqrt(gridSize), [gridSize]);
        const timeDilation = isSkillActive ? 1.5 : 1.0;

        const currentLevelConfig = useMemo(() => {
          const baseConfig = LEVEL_CONFIG[level];
          const difficultyModifier = DIFFICULTY_MODIFIERS[difficulty];
          const lengthModifier = GAME_LENGTH_MODIFIERS[gameLength];
          return {
            interval: baseConfig.interval * difficultyModifier.interval,
            duration: Math.round(baseConfig.duration * lengthModifier.duration),
            scoreToPass: Math.round(baseConfig.scoreToPass * difficultyModifier.score * lengthModifier.score),
          };
        }, [level, difficulty, gameLength]);
        
        const effectiveInterval = useMemo(() => {
          let interval = currentLevelConfig.interval * timeDilation;
          if(activeBuffs.moleBoost) interval *= 0.6; // 40% faster
          if (job === '닌자' && unlockedJobs.includes('닌자')) interval *= 0.85;
          if (levelEvent === 'mole_frenzy') interval *= 0.7;
          if (activeBuffs.hammerSlowdown) interval *= 1.5;
          return interval;
        }, [currentLevelConfig.interval, timeDilation, activeBuffs, job, unlockedJobs, levelEvent]);
        
        const effectivePetProbability = useMemo(() => {
          let prob = PET_PROBABILITY;
          if (job === '보석상' && unlockedJobs.includes('보석상')) prob *= 1.5;
          if (levelEvent === 'gold_rush') prob = 0.5; // Massive boost for gold rush
          return prob;
        }, [job, unlockedJobs, levelEvent]);
        
        const effectiveBombProbability = useMemo(() => {
            if (levelEvent === 'bomb_scare') return BOMB_PROBABILITY * 2;
            return BOMB_PROBABILITY;
        }, [levelEvent]);

        const [timeLeft, setTimeLeft] = useState(currentLevelConfig.duration);
        
        const triggerScorePulse = () => { setScorePulse(true); setTimeout(() => setScorePulse(false), 200); };
        const updateScore = useCallback((change: number) => {
            if (activeBuffs.scoreFreeze && change > 0) return;
            if (change > 0) setEarnedGoldInRun(prev => prev + change);
            setScore(prevScore => Math.max(0, prevScore + change));
            triggerScorePulse();
        }, [activeBuffs.scoreFreeze]);

        useEffect(() => { setEntities(new Array(gridSize).fill({type: 'empty'})); }, [gridSize]);

        const addBuff = useCallback((buffType: string, durationSeconds: number, data = {}) => {
            let finalDuration = durationSeconds;
            if (job === '음악가' && unlockedJobs.includes('음악가')) {
                finalDuration *= 1.2;
            }
            setActiveBuffs(prev => ({ ...prev, [buffType]: { expiresAt: Date.now() + finalDuration * 1000, ...data } }));
        }, [job, unlockedJobs]);
        
        const startFeverTime = useCallback(() => {
            if (activeBuffs.fever) return;
            setFeverActivationMessage(true);
            setTimeout(() => setFeverActivationMessage(false), 2000);
            addBuff('fever', FEVER_DURATION_SECONDS);
        }, [activeBuffs.fever, addBuff]);
        
        const showDisplayMessage = useCallback((message: string, isGood: boolean) => {
            setDisplayMessage({ message, isGood });
            setTimeout(() => setDisplayMessage(null), 2500);
        }, []);

        const openMysteryBox = useCallback(() => {
            const outcomes = [
                { type: 'good', message: '💰 +25 골드!', effect: () => setEarnedGoldInRun(g => g + 25) },
                { type: 'good', message: '✨ +10 점수!', effect: () => updateScore(10) },
                { type: 'good', message: '🔥 즉시 피버 타임!', effect: () => startFeverTime() },
                { type: 'good', message: '🍖 두더지 미끼 획득!', effect: () => setPowerups(p => ({ ...p, mole_bait: (p.mole_bait || 0) + 1 })) },
                { type: 'bad', message: '💣 폭탄 2개 등장!', effect: () => {
                    setEntities(prev => {
                        const newE = [...prev];
                        const emptySpots = newE.map((e, i) => e.type === 'empty' ? i : -1).filter(i => i !== -1);
                        for (let i = 0; i < 2; i++) {
                            if (emptySpots.length > 0) {
                                const spotIdx = emptySpots.splice(Math.floor(Math.random() * emptySpots.length), 1)[0];
                                newE[spotIdx] = { type: 'bomb' };
                            }
                        }
                        return newE;
                    });
                }},
                { type: 'bad', message: '🥶 3초간 점수 획득 불가!', effect: () => addBuff('scoreFreeze', 3) },
                { type: 'bad', message: '💸 -10 골드!', effect: () => setEarnedGoldInRun(g => Math.max(0, g - 10)) },
            ];
            const chosenOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            chosenOutcome.effect();
            showDisplayMessage(chosenOutcome.message, chosenOutcome.type === 'good');
        }, [updateScore, startFeverTime, addBuff, showDisplayMessage]);

        useEffect(() => {
          const timer = setInterval(() => {
            const now = Date.now();
            const newBuffs = { ...activeBuffs };
            let buffsChanged = false;
            Object.keys(newBuffs).forEach(key => {
              if (now >= newBuffs[key].expiresAt) {
                delete newBuffs[key];
                buffsChanged = true;
              }
            });
            if (buffsChanged) setActiveBuffs(newBuffs);
            
            setBuffTimers(() => {
                const newTimers: Record<string, number> = {};
                Object.keys(newBuffs).forEach(key => {
                    newTimers[key] = Math.ceil((newBuffs[key].expiresAt - now) / 1000);
                });
                return newTimers;
            });
          }, 250);
          return () => clearInterval(timer);
        }, [activeBuffs]);
        
        const finalizeRun = useCallback(() => {
            let goldMultiplier = 1.0;
            if (job === '수집가' && unlockedJobs.includes('수집가')) goldMultiplier += 0.2;
            goldMultiplier += (upgrades.gold_bonus || 0) * 0.05;
            const finalGold = Math.ceil(earnedGoldInRun * goldMultiplier);
            setGold(prev => prev + finalGold);

            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('whac-a-mole-highscore', score.toString());
            }
        }, [earnedGoldInRun, highScore, job, score, unlockedJobs, upgrades.gold_bonus]);

        useEffect(() => {
          if (gameState !== 'playing') return;
          if (timeLeft <= 0) {
            setEntities(new Array(gridSize).fill({type: 'empty'}));
            const passed = score >= currentLevelConfig.scoreToPass;
            if (passed && level < MAX_LEVEL) {
              setGameState('levelComplete');
            } else {
              finalizeRun();
              if (passed && level === MAX_LEVEL) setGameState('gameComplete');
              else setGameState('gameOver');
            }
            return;
          }
          const timerId = setTimeout(() => {
              setTimeLeft(timeLeft - 1);
              if (skillCooldown > 0) setSkillCooldown(prev => prev - 1);
          }, 1000 * timeDilation);
          return () => clearTimeout(timerId);
        }, [gameState, timeLeft, score, gridSize, skillCooldown, timeDilation, level, currentLevelConfig.scoreToPass, finalizeRun]);

        useEffect(() => {
          if (gameState !== 'playing') return;
          const moleIntervalId = setInterval(() => {
            setEntities(prevEntities => {
                const newEntities: Entity[] = new Array(gridSize).fill({ type: 'empty' });
                const numToShow = Math.min(Math.floor(level / 2) + Math.floor(gridSize / 9), Math.floor(gridSize / 2));
                let availableSpots = Array.from(Array(gridSize).keys());
                
                const isFever = !!activeBuffs.fever;

                for(let i=0; i < numToShow; i++) {
                    if (availableSpots.length === 0) break;
                    const spotIndex = availableSpots.splice(Math.floor(Math.random() * availableSpots.length), 1)[0];
                    
                    if(isMoleBaitActive) {
                      newEntities[spotIndex] = { type: 'mole' };
                      continue;
                    }

                    if (levelEvent === 'gold_rush') {
                        if (Math.random() < 0.5) newEntities[spotIndex] = { type: 'pet', subType: 'golden_mole' };
                        else newEntities[spotIndex] = { type: 'mole' };
                        continue;
                    }

                    const rand = Math.random();
                    const canThiefAppear = earnedGoldInRun >= 10;
                    const canKingAppear = level >= 3;
                    
                    const p_king = canKingAppear ? KING_MOLE_PROBABILITY : 0;
                    const p_thief = canThiefAppear ? THIEF_MOLE_PROBABILITY : 0;
                    const p_joker = JOKER_MOLE_PROBABILITY;
                    const p_cursed = CURSED_MOLE_PROBABILITY;
                    const p_pet = effectivePetProbability;
                    const p_bomb = effectiveBombProbability;
                    const p_item = ITEM_PROBABILITY;

                    if (isFever) {
                        if (rand < PET_PROBABILITY + ITEM_PROBABILITY) {
                            const petTypes = (Object.keys(PET_CONFIG) as PetSubType[]).filter(p => p !== 'king_mole' && p !== 'thief_mole' && p !== 'joker_mole');
                            const chosenPet = petTypes[Math.floor(Math.random() * petTypes.length)];
                            newEntities[spotIndex] = { type: 'pet', subType: chosenPet, hits: chosenPet === 'tank_mole' ? 2 : undefined };
                        } else {
                            newEntities[spotIndex] = { type: 'mole' };
                        }
                    } else {
                        if (rand < p_king) {
                            newEntities[spotIndex] = { type: 'pet', subType: 'king_mole', hits: 3 };
                        } else if (rand < p_king + p_thief) {
                           const goldToSteal = Math.max(1, Math.min(10, Math.floor(earnedGoldInRun * 0.2)));
                           setEarnedGoldInRun(g => g - goldToSteal);
                           newEntities[spotIndex] = { type: 'pet', subType: 'thief_mole', stolenGold: goldToSteal };
                        } else if (rand < p_king + p_thief + p_joker) {
                            newEntities[spotIndex] = { type: 'pet', subType: 'joker_mole' };
                        } else if (rand < p_king + p_thief + p_joker + p_cursed) {
                            newEntities[spotIndex] = { type: 'cursed_mole' };
                        } else if (rand < p_king + p_thief + p_joker + p_cursed + p_pet) {
                          let petTypes = (Object.keys(PET_CONFIG) as PetSubType[]).filter(p => p !== 'thief_mole' && p !== 'king_mole' && p !== 'joker_mole');
                          if(levelEvent === 'tank_outbreak' && Math.random() < 0.5) {
                            newEntities[spotIndex] = { type: 'pet', subType: 'tank_mole', hits: 2};
                          } else {
                            const chosenPet = petTypes[Math.floor(Math.random() * petTypes.length)];
                            const petEntity: Entity = { type: 'pet', subType: chosenPet, hits: chosenPet === 'tank_mole' ? 2 : undefined };
                            newEntities[spotIndex] = petEntity;
                          }
                        }
                        else if (rand < p_king + p_thief + p_joker + p_cursed + p_pet + p_bomb) {
                          if (job === '마법사' && unlockedJobs.includes('마법사') && Math.random() < 0.3) {
                            newEntities[spotIndex] = { type: 'pet', subType: 'gem_mole' };
                          } else {
                            newEntities[spotIndex] = { type: 'bomb' };
                          }
                        }
                        else if (rand < p_king + p_thief + p_joker + p_cursed + p_pet + p_bomb + p_item) {
                           newEntities[spotIndex] = { type: 'clock' };
                        }
                        else newEntities[spotIndex] = { type: 'mole' };
                    }
                }
                if (!isMoleBaitActive && job === '점성술사' && unlockedJobs.includes('점성술사') && Math.random() < 0.25) {
                    const moleIndices = newEntities.map((e, i) => e.type === 'mole' ? i : -1).filter(i => i !== -1);
                    if (moleIndices.length > 0) {
                        const hintedIndex = moleIndices[Math.floor(Math.random() * moleIndices.length)];
                        setNextMoleHint(hintedIndex);
                        setTimeout(() => setNextMoleHint(null), effectiveInterval * 0.8);
                    }
                } else { setNextMoleHint(null); }
                return newEntities;
            });
          }, effectiveInterval);
          return () => clearInterval(moleIntervalId);
        }, [gameState, gridSize, level, job, unlockedJobs, isMoleBaitActive, effectiveInterval, effectivePetProbability, effectiveBombProbability, activeBuffs.fever, levelEvent, earnedGoldInRun]);
        
        const setupLevel = useCallback((targetLevel: number, initialScore = 0, initialGold = 0) => {
          setLevel(targetLevel);
          setScore(initialScore);
          setEarnedGoldInRun(initialGold);
          setMolesWhacked(0);
          setCombo(0);
          setSkillCooldown(0);
          setIsSkillActive(false);
          setIsMoleBaitActive(false);
          setNextMoleHint(null);
          setActiveBuffs({});
          setBuffTimers({});
          setLevelEvent(null);
          
          if (targetLevel > 1 && Math.random() < 0.35) { // 35% chance for an event
            const events: LevelEvent[] = ['mole_frenzy', 'bomb_scare', 'gold_rush', 'tank_outbreak'];
            const eventMessages: Record<string, string> = {'mole_frenzy': '두더지 광란!', 'bomb_scare': '폭탄 주의보!', 'gold_rush': '골드 러시!', 'tank_outbreak': '튼튼 두더지 대출현!'};
            const chosenEvent = events[Math.floor(Math.random() * events.length)];
            setLevelEvent(chosenEvent);
            setEventMessage(eventMessages[chosenEvent]);
            setTimeout(() => setEventMessage(null), 3000);
          }

          const newConfig = LEVEL_CONFIG[targetLevel];
          const lengthModifier = GAME_LENGTH_MODIFIERS[gameLength];
          let duration = Math.round(newConfig.duration * lengthModifier.duration);
          if (job === '엔지니어' && unlockedJobs.includes('엔지니어')) duration += 5;
          if (targetLevel === 1 && job === '탐험가' && unlockedJobs.includes('탐험가') && gridSize >= 16) {
              duration += 5;
          }
          setTimeLeft(duration);
          setGameState('playing');
        }, [gameLength, job, unlockedJobs, gridSize]);

        const startGame = useCallback(() => {
          if (job === '자연주의자' && unlockedJobs.includes('자연주의자')) {
            setPowerups(p => ({ ...p, mole_bait: (p.mole_bait || 0) + 1 }));
          }
          let startingGold = 0;
          if (job === '은행가' && unlockedJobs.includes('은행가')) {
            startingGold = Math.min(Math.floor(gold * 0.01), 50);
          }
          setupLevel(1, 0, startingGold);
        }, [setupLevel, job, unlockedJobs, gold]);
        const startNextLevel = useCallback(() => { level < MAX_LEVEL ? setupLevel(level + 1, score, earnedGoldInRun) : setGameState('gameComplete'); }, [level, setupLevel, score, earnedGoldInRun]);
        
        const restartGame = useCallback(() => {
            setGameState('idle');
            setScore(0);
            setEarnedGoldInRun(0);
            setLevel(1);
            setLevelEvent(null);
            const newConfig = LEVEL_CONFIG[1];
            const lengthMod = GAME_LENGTH_MODIFIERS[gameLength];
            setTimeLeft(Math.round(newConfig.duration * lengthMod.duration));
        }, [gameLength]);
        
        const quitGame = useCallback(() => {
            finalizeRun();
            restartGame();
        }, [finalizeRun, restartGame]);

        const togglePause = useCallback(() => setGameState(prev => (prev === 'playing' ? 'paused' : 'playing')), []);

        const whackHole = useCallback((index: number) => {
          const entity = entities[index];
          if (entity.type !== 'empty') {
            let scoreChange = 0;
            let isSuccess = false;

            switch (entity.type) {
              case 'mole':
                isSuccess = true;
                setEarnedGoldInRun(prev => prev + 1);
                if (job === '연금술사' && unlockedJobs.includes('연금술사') && Math.random() < 0.15) {
                    setEarnedGoldInRun(prev => prev + 1);
                }
                let baseScore = 1 + (upgrades.mole_score || 0);
                if (job === '닌자' && unlockedJobs.includes('닌자')) baseScore += 1;
                
                if (activeBuffs.jokerTime) {
                    baseScore = Math.floor(Math.random() * 8) - 2; // -2 to +5
                } else if (job === '도박사' && unlockedJobs.includes('도박사')) {
                    const rand = Math.random();
                    if (rand < 0.05) baseScore = 0;
                    else if (rand < 0.15) baseScore *= 2;
                }
                scoreChange = baseScore;
                const newWhackedCount = molesWhacked + 1;
                setMolesWhacked(newWhackedCount);
                if (job === '농부' && unlockedJobs.includes('농부') && newWhackedCount % 10 === 0) scoreChange += 2;
                break;
              case 'clock':
                isSuccess = true;
                const timeBonus = (job === '엔지니어' && unlockedJobs.includes('엔지니어') ? 3 : 2) + (upgrades.clock_time || 0);
                setTimeLeft(prevTime => prevTime + timeBonus);
                if (job === '요리사' && unlockedJobs.includes('요리사')) scoreChange = 1;
                break;
              case 'cursed_mole':
                setCombo(0);
                isSuccess = false;
                const curses = ['hammerSlowdown', 'scoreFreeze'];
                const chosenCurse = curses[Math.floor(Math.random() * curses.length)];
                if (chosenCurse === 'hammerSlowdown') addBuff('hammerSlowdown', 5);
                else if (chosenCurse === 'scoreFreeze') addBuff('scoreFreeze', 3);
                break;
              case 'bomb':
                setCombo(0);
                if (job === '유령' && unlockedJobs.includes('유령') && Math.random() < 0.25) {
                  scoreChange = 0;
                } else if (job === '폭탄 전문가' && unlockedJobs.includes('폭탄 전문가')) {
                  scoreChange = 5;
                  isSuccess = true; // Bomb expert defusal is a success
                } else if((powerups.bomb_defusal_kit || 0) > 0) {
                   setPowerups(p => ({ ...p, bomb_defusal_kit: p.bomb_defusal_kit - 1 }));
                } else {
                   let penalty = (job === '광부' && unlockedJobs.includes('광부')) ? 2 : 3;
                   if (job === '의사' && unlockedJobs.includes('의사')) penalty *= 0.5;
                   scoreChange = -penalty;
                }
                break;
              case 'pet':
                isSuccess = true;
                switch(entity.subType) {
                    case 'tank_mole':
                        const tankNewHits = (entity.hits ?? 2) - 1;
                        if (tankNewHits > 0) {
                            setEntities(prev => { const newE = [...prev]; newE[index] = { ...newE[index], hits: tankNewHits }; return newE; });
                            return; // Don't process score/combo until fully defeated
                        }
                        scoreChange = 3; setEarnedGoldInRun(g => g + 2);
                        break;
                    case 'king_mole':
                        const kingNewHits = (entity.hits ?? 3) - 1;
                        if (kingNewHits > 0) {
                            setEntities(prev => { const newE = [...prev]; newE[index] = { ...newE[index], hits: kingNewHits }; return newE; });
                            return;
                        }
                        scoreChange = 10; setEarnedGoldInRun(g => g + 15);
                        break;
                    case 'joker_mole':
                        const rand = Math.random();
                        if (rand < 0.30) {
                            const goldGained = Math.floor(Math.random() * 6) + 3;
                            setEarnedGoldInRun(g => g + goldGained);
                            showDisplayMessage(`🃏 +${goldGained} 골드!`, true);
                        } else if (rand < 0.60) {
                            const scoreGained = Math.floor(Math.random() * 4) + 2;
                            scoreChange = scoreGained;
                            showDisplayMessage(`🃏 +${scoreGained} 점수!`, true);
                        } else if (rand < 0.80) {
                            scoreChange = -3;
                            showDisplayMessage(`🃏 -3 점수...`, false);
                        } else if (rand < 0.95) {
                            showDisplayMessage(`🃏 폭탄 등장!`, false);
                            setEntities(prev => {
                                const newE = [...prev];
                                const emptySpots = newE.map((e, i) => e.type === 'empty' ? i : -1).filter(i => i !== -1);
                                if (emptySpots.length > 0) {
                                    const spotIdx = emptySpots.splice(Math.floor(Math.random() * emptySpots.length), 1)[0];
                                    newE[spotIdx] = { type: 'bomb' };
                                }
                                return newE;
                            });
                        } else {
                            showDisplayMessage(`🃏 조커 타임!`, true);
                            addBuff('jokerTime', 5);
                        }
                        break;
                    case 'golden_mole': setEarnedGoldInRun(g => g + 10); addBuff('scoreDoubled', 5); break;
                    case 'fairy_mole': setTimeLeft(t => t + 5); addBuff('moleBoost', 10); break;
                    case 'lucky_clover': setEarnedGoldInRun(g => g + Math.floor(Math.random() * 5) + 1); break;
                    case 'gem_mole': scoreChange = 3; break;
                    case 'mystery_box_mole': openMysteryBox(); break;
                    case 'thief_mole':
                        const returnedGold = (entity.stolenGold || 0) * 2;
                        setEarnedGoldInRun(g => g + returnedGold);
                        scoreChange = 1;
                        break;
                }
                break;
            }

            // Apply global multipliers
            if (activeBuffs.scoreDoubled && scoreChange > 0) scoreChange *= 2;
            if (activeBuffs.fever && scoreChange > 0) scoreChange *= 2;
            
            if (isSuccess) {
                const newCombo = combo + 1;
                setCombo(newCombo);
                if (job === '사냥꾼' && unlockedJobs.includes('사냥꾼') && newCombo > 0 && newCombo % 5 === 0) {
                    scoreChange += 5;
                }
                if (newCombo > 0 && newCombo % FEVER_COMBO_THRESHOLD === 0) {
                    startFeverTime();
                }
            } else {
                setCombo(0);
            }
            
            if (scoreChange !== 0) updateScore(scoreChange);
            setEntities(prevEntities => { const newEntities = [...prevEntities]; newEntities[index] = { type: 'empty' }; return newEntities; });
          }
        }, [entities, job, molesWhacked, unlockedJobs, powerups, activeBuffs, upgrades, updateScore, combo, startFeverTime, addBuff, openMysteryBox, showDisplayMessage]);

        const handleSkillUse = () => { if (job === '시간 여행자' && skillCooldown === 0 && gameState === 'playing') { setIsSkillActive(true); setSkillCooldown(20); setTimeout(() => setIsSkillActive(false), 5000); }};
        const useMoleBait = () => {
            if ((powerups.mole_bait || 0) > 0 && !isMoleBaitActive && gameState === 'playing') {
                setPowerups(prev => ({ ...prev, mole_bait: prev.mole_bait - 1 }));
                setIsMoleBaitActive(true);
                setTimeout(() => setIsMoleBaitActive(false), 5000);
            }
        };

        const handleMiss = () => {
          if (gameState === 'playing') {
            setCombo(0);
          }
        };

        const renderModalContent = () => {
          let goldMultiplier = 1.0;
          if (job === '수집가' && unlockedJobs.includes('수집가')) goldMultiplier += 0.2;
          goldMultiplier += (upgrades.gold_bonus || 0) * 0.05;
          const finalGold = Math.ceil(earnedGoldInRun * goldMultiplier);
          
          switch (gameState) {
            case 'paused': return (<div className="text-center bg-black/70 p-8 rounded-2xl shadow-xl border-4 border-gray-500 flex flex-col items-center gap-4"><h2 className="text-5xl font-bold text-white drop-shadow-lg mb-4">일시정지</h2><button onClick={togglePause} className="w-48 px-6 py-3 bg-green-500 text-white font-bold text-xl rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105">계속하기</button><button onClick={quitGame} className="w-48 px-6 py-3 bg-red-500 text-white font-bold text-xl rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-105">게임 나가기</button></div>);
            case 'levelComplete': return (<div className="text-center bg-blue-100 p-8 rounded-2xl shadow-xl border-4 border-blue-400"><h2 className="text-4xl font-bold text-blue-700">레벨 {level} 클리어!</h2><p className="text-xl mt-2 text-blue-600">점수: {score}점</p><p className="text-lg mt-1">다음 레벨로 진행하세요!</p></div>);
            case 'gameOver': return (<div className="text-center bg-red-100 p-8 rounded-2xl shadow-xl border-4 border-red-400"><h2 className="text-4xl font-bold text-red-700">게임 종료!</h2><p className="text-xl mt-2 text-red-600">최종 점수: {score}점</p><p className="text-lg mt-2 font-bold text-yellow-600">획득 골드: {finalGold} G</p>{score < currentLevelConfig.scoreToPass && (<p className="text-lg mt-1 text-red-500">목표 점수({currentLevelConfig.scoreToPass}점)를 달성하지 못했습니다.</p>)}</div>);
            case 'gameComplete': return (<div className="text-center bg-green-100 p-8 rounded-2xl shadow-xl border-4 border-green-400"><h2 className="text-4xl font-bold text-green-700">모든 레벨 클리어!</h2><p className="text-xl mt-2 text-green-600">최종 점수: {score}점</p><p className="text-lg mt-2 font-bold text-yellow-600">획득 골드: {finalGold} G</p><p className="mt-4">축하합니다! 당신은 두더지 잡기의 명수입니다!</p></div>)
            default: return null;
          }
        };

        return (
          <main className="min-h-screen bg-green-200 flex flex-col items-center justify-center p-4 text-amber-900 select-none">
            <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} gold={gold} powerups={powerups} unlockedJobs={unlockedJobs} upgrades={upgrades} setGold={setGold} setPowerups={setPowerups} setUnlockedJobs={setUnlockedJobs} setUpgrades={setUpgrades} job={job} />
            <div className={`w-full max-w-2xl mx-auto bg-amber-200/70 p-4 sm:p-8 rounded-3xl shadow-2xl border-8 border-amber-800/50 transition-shadow duration-500 ${activeBuffs.fever ? 'fever-active' : ''}`}>
              
              <header className="relative text-center mb-4">
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-wider">두더지 잡기</h1>
                <p className="text-lg text-amber-800 mt-1">상점에서 아이템을 구매하고 최고 점수에 도전하세요!</p>
              </header>

              <div className="grid grid-cols-2 gap-4 bg-amber-100 rounded-lg p-3 sm:p-4 mb-2 text-xl sm:text-2xl font-bold shadow-md">
                  <div className={`flex items-center col-span-1 transition-transform duration-200 ${scorePulse ? 'scale-125 text-yellow-500' : ''}`}><HammerIcon /><span>점수: {score}</span></div>
                  <div className="flex items-center col-span-1 justify-end"><TimerIcon /><span>시간: {timeLeft}</span></div>
                  <div className="col-span-2 text-center text-base sm:text-lg text-amber-700">
                    <span>레벨: {level} ({difficulty})</span><span className="mx-2 sm:mx-4">|</span>
                    <span>직업: {job}</span><span className="mx-2 sm:mx-4">|</span>
                    <span>목표: {currentLevelConfig.scoreToPass}점</span>
                  </div>
              </div>
              
              <div className="h-8 mb-2">
                {gameState === 'playing' && (
                  <div className="flex justify-center items-center flex-wrap gap-2 text-center font-bold h-full">
                    {buffTimers.scoreDoubled && <span className="text-purple-700 bg-purple-200/50 rounded-lg px-2 py-1 shadow-inner text-sm">🌟 점수 2배! ({buffTimers.scoreDoubled}초)</span>}
                    {buffTimers.moleBoost && <span className="text-pink-700 bg-pink-200/50 rounded-lg px-2 py-1 shadow-inner text-sm">🧚 속도 UP! ({buffTimers.moleBoost}초)</span>}
                    {buffTimers.fever && <span className="text-red-500 bg-red-200/50 rounded-lg px-2 py-1 shadow-inner text-sm animate-pulse">🔥 피버! ({buffTimers.fever}초)</span>}
                    {buffTimers.jokerTime && <span className="text-indigo-700 bg-indigo-200/50 rounded-lg px-2 py-1 shadow-inner text-sm">🃏 조커 타임! ({buffTimers.jokerTime}초)</span>}
                    {combo > 1 && <span className="text-orange-700 bg-orange-200/50 rounded-lg px-2 py-1 shadow-inner text-sm">🎯 {combo} 콤보</span>}
                    {buffTimers.hammerSlowdown && <span className="text-red-700 bg-red-200/50 rounded-lg px-2 py-1 shadow-inner text-sm">💀 둔화! ({buffTimers.hammerSlowdown}초)</span>}
                    {buffTimers.scoreFreeze && <span className="text-gray-700 bg-gray-300/50 rounded-lg px-2 py-1 shadow-inner text-sm">🥶 점수 정지! ({buffTimers.scoreFreeze}초)</span>}
                  </div>
                )}
              </div>
              
              <div className="text-center text-base sm:text-lg text-amber-700 bg-amber-100 rounded-lg p-2 mb-4 shadow-md flex justify-center items-center gap-6">
                <span>최고 점수: {highScore}</span>
                <span className="font-bold flex items-center"><GoldIcon /> {gold} G</span>
              </div>

              {gameState === 'idle' && (
                <div className="text-center my-4 p-3 bg-amber-100/50 rounded-lg space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">직업 선택</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
                      {unlockedJobs.map(j => (
                        <button key={j} onClick={() => setJob(j)} className={`p-2 sm:p-4 text-sm sm:text-base border-4 rounded-lg transition-all duration-200 ${job === j ? 'bg-orange-500 text-white border-orange-700 scale-105 shadow-lg' : 'bg-white text-amber-900 border-gray-200 hover:bg-gray-100'}`}>
                          <div className="text-2xl sm:text-4xl">{JOB_CONFIG[j]?.icon || '?'}</div>
                          <div className="font-bold mt-1">{JOB_CONFIG[j]?.name || j}</div>
                          <div className="text-xs mt-1 hidden sm:block h-12">{JOB_CONFIG[j]?.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 pt-4">
                    <div>
                        <h3 className="font-bold text-lg mb-1">난이도</h3>
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                            {Object.keys(DIFFICULTY_MODIFIERS).map(d => ( <button key={d} onClick={() => setDifficulty(d as Difficulty)} type="button" className={`px-4 py-2 text-sm font-medium border first:rounded-l-lg last:rounded-r-lg ${difficulty === d ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-amber-900 border-gray-200 hover:bg-gray-100'}`}>{d}</button>))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">게임 길이</h3>
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                            {Object.keys(GAME_LENGTH_MODIFIERS).map(d => ( <button key={d} onClick={() => setGameLength(d as GameLength)} type="button" className={`px-4 py-2 text-sm font-medium border first:rounded-l-lg last:rounded-r-lg ${gameLength === d ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-amber-900 border-gray-200 hover:bg-gray-100'}`}>{d}</button>))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">게임판 크기</h3>
                        <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="px-4 py-2 text-sm font-medium rounded-lg border bg-white text-amber-900 border-gray-200 hover:bg-gray-100 focus:ring-2 focus:ring-orange-500">
                          {Array.from({ length: 9 }, (_, i) => i + 3).map(size => ( <option key={size} value={size * size}>{size} x {size}</option>))}
                        </select>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative">
                <div 
                  style={{ gridTemplateColumns: `repeat(${gridDimension}, 1fr)` }} 
                  className={`grid gap-1 sm:gap-2 w-full aspect-square bg-lime-700 p-2 sm:p-4 rounded-2xl shadow-inner ${gameState === 'playing' ? "cursor-[url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"48\" viewport=\"0 0 100 100\" style=\"fill:black;font-size:24px;\"><text y=\"50%\">🔨</text></svg>'),_auto]" : "cursor-default"}`}
                  onClick={handleMiss}
                >
                  {entities.map((entity, index) => ( <Hole key={index} entity={entity} onWhack={(e) => { e.stopPropagation(); whackHole(index); }} canWhack={gameState === 'playing'} isHinted={index === nextMoleHint} /> ))}
                </div>
                { feverActivationMessage && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <h2 className="text-6xl sm:text-8xl font-extrabold text-yellow-300 drop-shadow-lg fever-text" style={{ WebkitTextStroke: '2px black' }}>피버 타임!</h2>
                  </div>
                )}
                { eventMessage && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <h2 className="text-6xl sm:text-8xl font-extrabold text-yellow-300 drop-shadow-lg event-text" style={{ WebkitTextStroke: '3px black' }}>
                          {eventMessage}
                      </h2>
                  </div>
                )}
                { displayMessage && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        <div className={`p-4 rounded-xl shadow-lg text-white font-bold text-3xl mystery-box-reward ${displayMessage.isGood ? 'bg-blue-500' : 'bg-red-600'}`}>
                            {displayMessage.message}
                        </div>
                    </div>
                )}
                { (gameState !== 'playing' && gameState !== 'idle') && ( <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl p-4">{renderModalContent()}</div> )}
              </div>
              
              <div className="mt-8 text-center flex justify-center items-center flex-wrap gap-4">
                 {gameState === 'idle' && (
                  <div className="flex gap-4 w-full">
                    <button onClick={startGame} className="flex-grow px-10 py-4 bg-orange-500 text-white font-bold text-2xl rounded-xl shadow-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-105">게임 시작</button>
                    <button onClick={() => setIsShopOpen(true)} className="px-8 py-4 bg-sky-500 text-white font-bold text-2xl rounded-xl shadow-lg hover:bg-sky-600 transition-all duration-200 transform hover:scale-105">상점</button>
                  </div>
                )}
                {gameState === 'playing' && <button onClick={togglePause} className="px-10 py-4 bg-orange-500 text-white font-bold text-2xl rounded-xl shadow-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-105">일시정지</button>}
                {gameState === 'levelComplete' && <button onClick={startNextLevel} className="px-10 py-4 bg-green-500 text-white font-bold text-2xl rounded-xl shadow-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105">다음 단계</button>}
                {(gameState === 'gameOver' || gameState === 'gameComplete') && <button onClick={restartGame} className="px-10 py-4 bg-blue-500 text-white font-bold text-2xl rounded-xl shadow-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105">다시 시작</button>}
                
                {job === '시간 여행자' && gameState === 'playing' && (
                  <button onClick={handleSkillUse} disabled={skillCooldown > 0} className={`px-6 py-3 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 transform ${skillCooldown > 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'} ${isSkillActive ? 'animate-pulse ring-4 ring-purple-300' : ''}`}>
                      {skillCooldown > 0 ? `쿨타임: ${skillCooldown}초` : '시간 왜곡'}
                  </button>
                )}
                {gameState === 'playing' && (powerups.mole_bait || 0) > 0 && (
                  <button onClick={useMoleBait} disabled={isMoleBaitActive} className={`px-6 py-3 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 transform ${isMoleBaitActive ? 'bg-yellow-700 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 hover:scale-105'}`}>
                      🍖 미끼 ({powerups.mole_bait}) {isMoleBaitActive && '(활성)'}
                  </button>
                )}
              </div>
            </div>
          </main>
        );
      }

      const rootElement = document.getElementById('root');
      if (!rootElement) { throw new Error("Could not find root element to mount to"); }
      const root = ReactDOM.createRoot(rootElement);
      root.render(<StrictMode><App /></StrictMode>);