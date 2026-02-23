// ========================================
// Infrastructure: Exercise Seed Data
// ========================================
import { getDatabase } from './connection.js';

interface SeedExercise {
  id: string;
  name: string;
  name_ja: string;
  muscle_group: string;
  met: number;
  description: string;
  input_type: string;
}

const SEED_EXERCISES: SeedExercise[] = [
  // 胸
  { id: 'ex-bench-press', name: 'Bench Press', name_ja: 'ベンチプレス', muscle_group: 'chest', met: 6.0, description: '大胸筋を鍛えるコンパウンド種目', input_type: 'reps_weight' },
  { id: 'ex-incline-press', name: 'Incline Bench Press', name_ja: 'インクラインベンチプレス', muscle_group: 'chest', met: 6.0, description: '大胸筋上部を鍛える種目', input_type: 'reps_weight' },
  { id: 'ex-decline-press', name: 'Decline Bench Press', name_ja: 'デクラインベンチプレス', muscle_group: 'chest', met: 6.0, description: '大胸筋下部を鍛える種目', input_type: 'reps_weight' },
  { id: 'ex-dumbbell-fly', name: 'Dumbbell Fly', name_ja: 'ダンベルフライ', muscle_group: 'chest', met: 5.0, description: '大胸筋のストレッチ系種目', input_type: 'reps_weight' },
  { id: 'ex-incline-fly', name: 'Incline Dumbbell Fly', name_ja: 'インクラインダンベルフライ', muscle_group: 'chest', met: 5.0, description: '大胸筋上部のストレッチ系種目', input_type: 'reps_weight' },
  { id: 'ex-cable-crossover', name: 'Cable Crossover', name_ja: 'ケーブルクロスオーバー', muscle_group: 'chest', met: 4.5, description: '大胸筋を収縮させるケーブル種目', input_type: 'reps_weight' },
  { id: 'ex-chest-dip', name: 'Chest Dip', name_ja: 'ディップス（胸）', muscle_group: 'chest', met: 5.5, description: '大胸筋下部・上腕三頭筋を鍛える自重種目', input_type: 'reps_only' },
  { id: 'ex-push-up', name: 'Push Up', name_ja: '腕立て伏せ', muscle_group: 'chest', met: 3.8, description: '自重で行う胸のトレーニング', input_type: 'reps_only' },
  { id: 'ex-dumbbell-press', name: 'Dumbbell Bench Press', name_ja: 'ダンベルベンチプレス', muscle_group: 'chest', met: 5.5, description: '可動域が広いダンベルを使った胸のプレス種目', input_type: 'reps_weight' },

  // 背中
  { id: 'ex-deadlift', name: 'Deadlift', name_ja: 'デッドリフト', muscle_group: 'back', met: 6.0, description: '後面全体を鍛えるBIG3種目', input_type: 'reps_weight' },
  { id: 'ex-lat-pulldown', name: 'Lat Pulldown', name_ja: 'ラットプルダウン', muscle_group: 'back', met: 5.0, description: '広背筋を鍛えるマシン種目', input_type: 'reps_weight' },
  { id: 'ex-barbell-row', name: 'Barbell Row', name_ja: 'バーベルロウ', muscle_group: 'back', met: 5.5, description: '広背筋・僧帽筋を鍛える', input_type: 'reps_weight' },
  { id: 'ex-dumbbell-row', name: 'Dumbbell Row', name_ja: 'ダンベルロウ', muscle_group: 'back', met: 5.0, description: '片側ずつ広背筋を鍛えるロウ種目', input_type: 'reps_weight' },
  { id: 'ex-seated-cable-row', name: 'Seated Cable Row', name_ja: 'シーテッドケーブルロウ', muscle_group: 'back', met: 4.5, description: '広背筋・僧帽筋中部を鍛えるケーブル種目', input_type: 'reps_weight' },
  { id: 'ex-t-bar-row', name: 'T-Bar Row', name_ja: 'Tバーロウ', muscle_group: 'back', met: 5.5, description: '背中の厚みを作るコンパウンド種目', input_type: 'reps_weight' },
  { id: 'ex-chin-up', name: 'Chin Up', name_ja: '懸垂', muscle_group: 'back', met: 5.5, description: '自重で行う背中のトレーニング', input_type: 'reps_only' },
  { id: 'ex-pullover', name: 'Dumbbell Pullover', name_ja: 'ダンベルプルオーバー', muscle_group: 'back', met: 4.0, description: '広背筋・大胸筋を鍛えるストレッチ系種目', input_type: 'reps_weight' },
  { id: 'ex-hyperextension', name: 'Hyperextension', name_ja: 'バックエクステンション', muscle_group: 'back', met: 3.5, description: '脊柱起立筋・ハムストリングスを鍛える種目', input_type: 'reps_only' },

  // 肩
  { id: 'ex-overhead-press', name: 'Overhead Press', name_ja: 'オーバーヘッドプレス', muscle_group: 'shoulders', met: 5.0, description: '三角筋前部を鍛えるコンパウンド種目', input_type: 'reps_weight' },
  { id: 'ex-dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', name_ja: 'ダンベルショルダープレス', muscle_group: 'shoulders', met: 5.0, description: '三角筋全体を鍛えるダンベル種目', input_type: 'reps_weight' },
  { id: 'ex-lateral-raise', name: 'Lateral Raise', name_ja: 'サイドレイズ', muscle_group: 'shoulders', met: 4.0, description: '三角筋中部のアイソレーション種目', input_type: 'reps_weight' },
  { id: 'ex-front-raise', name: 'Front Raise', name_ja: 'フロントレイズ', muscle_group: 'shoulders', met: 3.5, description: '三角筋前部を鍛えるアイソレーション種目', input_type: 'reps_weight' },
  { id: 'ex-rear-delt-fly', name: 'Rear Delt Fly', name_ja: 'リアデルトフライ', muscle_group: 'shoulders', met: 3.5, description: '三角筋後部を鍛えるアイソレーション種目', input_type: 'reps_weight' },
  { id: 'ex-upright-row', name: 'Upright Row', name_ja: 'アップライトロウ', muscle_group: 'shoulders', met: 4.5, description: '三角筋中部・僧帽筋を鍛えるコンパウンド種目', input_type: 'reps_weight' },
  { id: 'ex-face-pull', name: 'Face Pull', name_ja: 'フェイスプル', muscle_group: 'shoulders', met: 3.5, description: '三角筋後部・僧帽筋下部を鍛える', input_type: 'reps_weight' },
  { id: 'ex-shrug', name: 'Barbell Shrug', name_ja: 'バーベルシュラッグ', muscle_group: 'shoulders', met: 4.0, description: '僧帽筋上部を鍛える種目', input_type: 'reps_weight' },

  // 腕
  { id: 'ex-bicep-curl', name: 'Bicep Curl', name_ja: 'バイセプスカール', muscle_group: 'arms', met: 3.5, description: '上腕二頭筋のアイソレーション種目', input_type: 'reps_weight' },
  { id: 'ex-hammer-curl', name: 'Hammer Curl', name_ja: 'ハンマーカール', muscle_group: 'arms', met: 3.5, description: '上腕二頭筋・腕橈骨筋を鍛える', input_type: 'reps_weight' },
  { id: 'ex-preacher-curl', name: 'Preacher Curl', name_ja: 'プリーチャーカール', muscle_group: 'arms', met: 3.5, description: '上腕二頭筋短頭を集中的に鍛える種目', input_type: 'reps_weight' },
  { id: 'ex-concentration-curl', name: 'Concentration Curl', name_ja: 'コンセントレーションカール', muscle_group: 'arms', met: 3.0, description: '上腕二頭筋のピークを作るアイソレーション種目', input_type: 'reps_weight' },
  { id: 'ex-tricep-pushdown', name: 'Tricep Pushdown', name_ja: 'トライセプスプッシュダウン', muscle_group: 'arms', met: 3.5, description: '上腕三頭筋のアイソレーション種目', input_type: 'reps_weight' },
  { id: 'ex-skull-crusher', name: 'Skull Crusher', name_ja: 'スカルクラッシャー', muscle_group: 'arms', met: 4.0, description: '上腕三頭筋を鍛えるバーベル種目', input_type: 'reps_weight' },
  { id: 'ex-tricep-kickback', name: 'Tricep Kickback', name_ja: 'トライセプスキックバック', muscle_group: 'arms', met: 3.0, description: '上腕三頭筋のアイソレーション種目', input_type: 'reps_weight' },
  { id: 'ex-tricep-overhead-ext', name: 'Tricep Overhead Extension', name_ja: 'トライセプスオーバーヘッドエクステンション', muscle_group: 'arms', met: 3.5, description: '上腕三頭筋長頭を鍛える種目', input_type: 'reps_weight' },
  { id: 'ex-close-grip-press', name: 'Close Grip Bench Press', name_ja: 'クローズグリップベンチプレス', muscle_group: 'arms', met: 5.0, description: '上腕三頭筋を重点的に鍛えるプレス種目', input_type: 'reps_weight' },
  { id: 'ex-wrist-curl', name: 'Wrist Curl', name_ja: 'リストカール', muscle_group: 'arms', met: 2.5, description: '前腕屈筋群を鍛える種目', input_type: 'reps_weight' },

  // 脚
  { id: 'ex-squat', name: 'Barbell Squat', name_ja: 'バーベルスクワット', muscle_group: 'legs', met: 6.0, description: '下半身全体を鍛えるBIG3種目', input_type: 'reps_weight' },
  { id: 'ex-goblet-squat', name: 'Goblet Squat', name_ja: 'ゴブレットスクワット', muscle_group: 'legs', met: 5.5, description: 'ダンベルを抱えて行う初心者にも◎なスクワット', input_type: 'reps_weight' },
  { id: 'ex-hack-squat', name: 'Hack Squat', name_ja: 'ハックスクワット', muscle_group: 'legs', met: 5.5, description: 'マシンで大腿四頭筋を集中的に鍛える種目', input_type: 'reps_weight' },
  { id: 'ex-leg-press', name: 'Leg Press', name_ja: 'レッグプレス', muscle_group: 'legs', met: 5.5, description: '大腿四頭筋を鍛えるマシン種目', input_type: 'reps_weight' },
  { id: 'ex-leg-extension', name: 'Leg Extension', name_ja: 'レッグエクステンション', muscle_group: 'legs', met: 4.0, description: '大腿四頭筋のアイソレーション種目', input_type: 'reps_weight' },
  { id: 'ex-leg-curl', name: 'Leg Curl', name_ja: 'レッグカール', muscle_group: 'legs', met: 4.5, description: 'ハムストリングスを鍛えるマシン種目', input_type: 'reps_weight' },
  { id: 'ex-romanian-deadlift', name: 'Romanian Deadlift', name_ja: 'ルーマニアンデッドリフト', muscle_group: 'legs', met: 5.5, description: 'ハムストリングス・臀部を鍛えるデッドリフト系種目', input_type: 'reps_weight' },
  { id: 'ex-hip-thrust', name: 'Hip Thrust', name_ja: 'ヒップスラスト', muscle_group: 'legs', met: 5.0, description: '大臀筋を最大収縮で鍛える種目', input_type: 'reps_weight' },
  { id: 'ex-lunge', name: 'Lunge', name_ja: 'ランジ', muscle_group: 'legs', met: 5.0, description: '片足ずつ下半身を鍛える種目', input_type: 'reps_weight' },
  { id: 'ex-bulgarian-split-squat', name: 'Bulgarian Split Squat', name_ja: 'ブルガリアンスプリットスクワット', muscle_group: 'legs', met: 5.5, description: '片足スクワットで大腿四頭筋・臀部を強烈に鍛える', input_type: 'reps_weight' },
  { id: 'ex-step-up', name: 'Step Up', name_ja: 'ステップアップ', muscle_group: 'legs', met: 5.0, description: '台を使った片足のトレーニング', input_type: 'reps_only' },
  { id: 'ex-calf-raise', name: 'Calf Raise', name_ja: 'カーフレイズ', muscle_group: 'legs', met: 3.5, description: 'ふくらはぎを鍛える種目', input_type: 'reps_weight' },
  { id: 'ex-seated-calf-raise', name: 'Seated Calf Raise', name_ja: 'シーテッドカーフレイズ', muscle_group: 'legs', met: 3.0, description: 'ヒラメ筋を鍛えるカーフレイズ', input_type: 'reps_weight' },
  { id: 'ex-sumo-deadlift', name: 'Sumo Deadlift', name_ja: 'スモウデッドリフト', muscle_group: 'legs', met: 6.0, description: '内転筋・臀部に効くワイドスタンスのデッドリフト', input_type: 'reps_weight' },

  // 体幹
  { id: 'ex-plank', name: 'Plank', name_ja: 'プランク', muscle_group: 'core', met: 3.0, description: '体幹を安定させる静的トレーニング', input_type: 'duration' },
  { id: 'ex-side-plank', name: 'Side Plank', name_ja: 'サイドプランク', muscle_group: 'core', met: 3.0, description: '腹斜筋・体幹側面を鍛える静的種目', input_type: 'duration' },
  { id: 'ex-crunch', name: 'Crunch', name_ja: 'クランチ', muscle_group: 'core', met: 3.5, description: '腹直筋を鍛えるトレーニング', input_type: 'reps_only' },
  { id: 'ex-leg-raise', name: 'Leg Raise', name_ja: 'レッグレイズ', muscle_group: 'core', met: 4.0, description: '腹直筋下部を鍛える種目', input_type: 'reps_only' },
  { id: 'ex-hanging-leg-raise', name: 'Hanging Leg Raise', name_ja: 'ハンギングレッグレイズ', muscle_group: 'core', met: 4.5, description: 'ぶら下がりながら腹筋下部を鍛える高強度種目', input_type: 'reps_only' },
  { id: 'ex-russian-twist', name: 'Russian Twist', name_ja: 'ロシアンツイスト', muscle_group: 'core', met: 3.5, description: '腹斜筋を鍛えるツイスト系種目', input_type: 'reps_only' },
  { id: 'ex-ab-wheel', name: 'Ab Wheel Rollout', name_ja: 'アブローラー', muscle_group: 'core', met: 4.5, description: '腹筋全体を鍛える高強度種目', input_type: 'reps_only' },
  { id: 'ex-mountain-climber', name: 'Mountain Climber', name_ja: 'マウンテンクライマー', muscle_group: 'core', met: 8.0, description: 'プランク姿勢から行う全身有酸素系体幹種目', input_type: 'duration' },
  { id: 'ex-cable-crunch', name: 'Cable Crunch', name_ja: 'ケーブルクランチ', muscle_group: 'core', met: 4.0, description: '負荷を調整できるケーブルを使ったクランチ', input_type: 'reps_weight' },
  { id: 'ex-dead-bug', name: 'Dead Bug', name_ja: 'デッドバグ', muscle_group: 'core', met: 3.0, description: '腰椎を安定させながら体幹を鍛える種目', input_type: 'duration' },

  // 全身
  { id: 'ex-clean-and-jerk', name: 'Clean and Jerk', name_ja: 'クリーン&ジャーク', muscle_group: 'full_body', met: 6.5, description: 'オリンピックリフティング種目', input_type: 'reps_weight' },
  { id: 'ex-snatch', name: 'Snatch', name_ja: 'スナッチ', muscle_group: 'full_body', met: 7.0, description: 'オリンピックリフティング・爆発的全身種目', input_type: 'reps_weight' },
  { id: 'ex-burpee', name: 'Burpee', name_ja: 'バーピー', muscle_group: 'full_body', met: 8.0, description: '全身を使う高強度自重トレーニング', input_type: 'reps_only' },
  { id: 'ex-kettlebell-swing', name: 'Kettlebell Swing', name_ja: 'ケトルベルスイング', muscle_group: 'full_body', met: 6.0, description: '全身の爆発力を鍛える種目', input_type: 'reps_weight' },
  { id: 'ex-turkish-getup', name: 'Turkish Get-Up', name_ja: 'トルコ式ゲットアップ', muscle_group: 'full_body', met: 5.5, description: '全身の安定性と筋持久力を鍛える種目', input_type: 'reps_weight' },
  { id: 'ex-thruster', name: 'Thruster', name_ja: 'スラスター', muscle_group: 'full_body', met: 7.5, description: 'スクワット+オーバーヘッドプレスを連続して行う高強度種目', input_type: 'reps_weight' },
  { id: 'ex-man-maker', name: 'Man Maker', name_ja: 'マンメーカー', muscle_group: 'full_body', met: 8.0, description: 'ダンベルを使った高強度全身コンビネーション種目', input_type: 'reps_weight' },

  // 有酸素
  { id: 'ex-treadmill', name: 'Treadmill Running', name_ja: 'トレッドミル', muscle_group: 'cardio', met: 8.0, description: 'ランニングマシンでの有酸素運動。傾斜(%)で強度を調整可', input_type: 'cardio' },
  { id: 'ex-cycling', name: 'Stationary Cycling', name_ja: 'エアロバイク', muscle_group: 'cardio', met: 6.5, description: '自転車マシンでの有酸素運動。負荷レベル(1-10)を入力可', input_type: 'cardio' },
  { id: 'ex-rowing', name: 'Rowing Machine', name_ja: 'ローイングマシン', muscle_group: 'cardio', met: 7.0, description: 'ボート漕ぎマシンでの有酸素運動。負荷レベルを入力可', input_type: 'cardio' },
  { id: 'ex-jump-rope', name: 'Jump Rope', name_ja: '縄跳び', muscle_group: 'cardio', met: 11.0, description: '高強度の有酸素運動', input_type: 'cardio' },
  { id: 'ex-stair-climber', name: 'Stair Climber', name_ja: 'ステアクライマー', muscle_group: 'cardio', met: 9.0, description: '階段昇降マシンでの有酸素運動・下半身強化', input_type: 'cardio' },
  { id: 'ex-elliptical', name: 'Elliptical Trainer', name_ja: 'エリプティカル', muscle_group: 'cardio', met: 5.0, description: '関節への負担が少ない全身有酸素マシン', input_type: 'cardio' },
  { id: 'ex-assault-bike', name: 'Assault Bike', name_ja: 'アサルトバイク', muscle_group: 'cardio', met: 12.0, description: '上下肢を同時に動かす超高強度エアバイク', input_type: 'cardio' },
  { id: 'ex-battle-rope', name: 'Battle Rope', name_ja: 'バトルロープ', muscle_group: 'cardio', met: 10.0, description: '上半身中心の高強度有酸素インターバル種目', input_type: 'cardio' },
  { id: 'ex-box-jump', name: 'Box Jump', name_ja: 'ボックスジャンプ', muscle_group: 'cardio', met: 8.0, description: '台への跳び乗りで爆発力と有酸素能力を鍛える', input_type: 'reps_only' },
  { id: 'ex-swimming', name: 'Swimming', name_ja: '水泳', muscle_group: 'cardio', met: 7.0, description: '全身を使う低衝撃の有酸素運動', input_type: 'cardio' },

  // ハンマーストレングス（胸）
  { id: 'hs-chest-press', name: 'HS ISO-Lateral Chest Press', name_ja: 'HSチェストプレス（アイソラテラル）', muscle_group: 'chest', met: 5.5, description: '左右独立動作で大胸筋を均等に鍛えるプレートローディングマシン', input_type: 'reps_weight' },
  { id: 'hs-incline-press', name: 'HS ISO-Lateral Incline Press', name_ja: 'HSインクラインプレス（アイソラテラル）', muscle_group: 'chest', met: 5.5, description: '大胸筋上部を左右独立動作で鍛えるインクラインプレス', input_type: 'reps_weight' },
  { id: 'hs-decline-press', name: 'HS ISO-Lateral Decline Press', name_ja: 'HSデクラインプレス（アイソラテラル）', muscle_group: 'chest', met: 5.5, description: '大胸筋下部を左右独立動作で鍛えるデクラインプレス', input_type: 'reps_weight' },

  // ハンマーストレングス（背中）
  { id: 'hs-iso-low-row', name: 'HS ISO-Lateral Low Row', name_ja: 'HSローロウ（アイソラテラル）', muscle_group: 'back', met: 5.0, description: '広背筋下部・大円筋を左右独立で鍛えるプレートローディングロウ', input_type: 'reps_weight' },
  { id: 'hs-iso-high-row', name: 'HS ISO-Lateral High Row', name_ja: 'HSハイロウ（アイソラテラル）', muscle_group: 'back', met: 5.0, description: '広背筋上部・菱形筋を左右独立で鍛えるハイロウマシン', input_type: 'reps_weight' },
  { id: 'hs-wide-pulldown', name: 'HS ISO-Lateral Wide Pulldown', name_ja: 'HSワイドプルダウン（アイソラテラル）', muscle_group: 'back', met: 5.0, description: '広背筋外側を広げるワイドグリッププルダウンマシン', input_type: 'reps_weight' },
  { id: 'hs-front-pulldown', name: 'HS ISO-Lateral Front Lat Pulldown', name_ja: 'HSフロントラットプルダウン（アイソラテラル）', muscle_group: 'back', met: 4.5, description: '広背筋全体をプレートで鍛えるフロントプルダウン', input_type: 'reps_weight' },
  { id: 'hs-pull-up', name: 'HS Assisted Pull-Up / Dip', name_ja: 'HSアシストプルアップ・ディップ', muscle_group: 'back', met: 5.0, description: 'アシスト機能付きで懸垂・ディップスを行うハンマーストレングスマシン', input_type: 'reps_only' },

  // ハンマーストレングス（肩）
  { id: 'hs-shoulder-press', name: 'HS ISO-Lateral Shoulder Press', name_ja: 'HSショルダープレス（アイソラテラル）', muscle_group: 'shoulders', met: 4.5, description: '三角筋全体を左右独立動作で鍛えるプレートローディングマシン', input_type: 'reps_weight' },
  { id: 'hs-iso-lateral-raise', name: 'HS Lateral Raise Machine', name_ja: 'HSサイドレイズマシン', muscle_group: 'shoulders', met: 3.5, description: '三角筋中部を安定した軌道で鍛えるハンマーストレングスサイドレイズ', input_type: 'reps_weight' },

  // ハンマーストレングス（腕）
  { id: 'hs-preacher-curl', name: 'HS Preacher Curl', name_ja: 'HSプリーチャーカール', muscle_group: 'arms', met: 3.5, description: '上腕二頭筋短頭を固定軌道で徹底的に鍛えるマシン', input_type: 'reps_weight' },
  { id: 'hs-tricep-press', name: 'HS ISO-Lateral Overhead Tricep Press', name_ja: 'HSトライセプスプレス（アイソラテラル）', muscle_group: 'arms', met: 3.5, description: '上腕三頭筋長頭を左右独立で鍛えるオーバーヘッドプレスマシン', input_type: 'reps_weight' },

  // ハンマーストレングス（脚）
  { id: 'hs-leg-press', name: 'HS ISO-Lateral Leg Press', name_ja: 'HSレッグプレス（アイソラテラル）', muscle_group: 'legs', met: 5.5, description: '左右独立動作で大腿四頭筋・臀部を鍛えるプレートローディングマシン', input_type: 'reps_weight' },
  { id: 'hs-leg-curl', name: 'HS Seated Leg Curl', name_ja: 'HSシーテッドレッグカール', muscle_group: 'legs', met: 4.5, description: '座位でハムストリングスを集中的に鍛えるマシン。ストレッチポジションで負荷が強い', input_type: 'reps_weight' },
  { id: 'hs-prone-leg-curl', name: 'HS Prone Leg Curl', name_ja: 'HSプローンレッグカール（うつ伏せ）', muscle_group: 'legs', met: 4.0, description: 'うつ伏せ姿勢でハムストリングスを鍛える。収縮ポジションで最大負荷がかかる', input_type: 'reps_weight' },
  { id: 'hs-standing-calf', name: 'HS Standing Calf Raise', name_ja: 'HSスタンディングカーフレイズ', muscle_group: 'legs', met: 3.5, description: '腓腹筋をプレートローディングで鍛えるカーフレイズマシン', input_type: 'reps_weight' },
  { id: 'hs-glute-drive', name: 'HS Glute Drive', name_ja: 'HSグルートドライブ', muscle_group: 'legs', met: 5.0, description: '大臀筋をヒップスラスト動作でプレートを使って鍛えるマシン', input_type: 'reps_weight' },
];

export function seedExercises(): void {
  const db = getDatabase();

  const insert = db.prepare(`
    INSERT OR IGNORE INTO exercises (id, name, name_ja, muscle_group, met, description, input_type)
    VALUES (@id, @name, @name_ja, @muscle_group, @met, @description, @input_type)
  `);

  // 既存レコードの input_type も最新値に更新（マイグレーション後の DEFAULT 'reps_weight' を上書き）
  const updateType = db.prepare(`
    UPDATE exercises SET input_type = @input_type WHERE id = @id
  `);

  const seedAll = db.transaction((exercises: SeedExercise[]) => {
    for (const exercise of exercises) {
      insert.run(exercise);
      updateType.run({ id: exercise.id, input_type: exercise.input_type });
    }
  });

  seedAll(SEED_EXERCISES);
  console.log(`✅ Seeded ${SEED_EXERCISES.length} exercises`);
}

// 直接実行時にシードを実行
const isDirectRun = process.argv[1]?.includes('seed');
if (isDirectRun) {
  seedExercises();
  console.log('🌱 Database seeded successfully');
}
