import React, { useState } from 'react';
import { CheckCircle2, Circle, Calendar, Dumbbell, Heart, TrendingUp, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const FitnessTracker = () => {
  // 訓練計劃模板
  const trainingPlan = {
    上肢訓練: ['啞鈴肩推', '啞鈴胸推', '啞鈴划船', '啞鈴側平舉'],
    下肢訓練: ['啞鈴硬舉', '弓步蹲', '臀橋']
  };

  // 有氧訓練類型
  const cardioTypes = [
    '跑步機快走', '滑步機', '腳踏車機', '跑步機間歇', '瑜伽', '伸展'
  ];

  // 計算當前應該是第幾天
  const calculateCurrentDay = () => {
    const startDate = new Date('2025-08-11');
    const today = new Date();
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // 確保天數在1-50範圍內
    if (diffDays < 1) return 1;
    if (diffDays > 50) return 50;
    return diffDays;
  };

  // 初始化50天的訓練數據
  const initializeTrainingData = () => {
    const data = [];
    for (let day = 1; day <= 50; day++) {
      const dayOfWeek = ((day - 1) % 7);
      const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
      
      let cardioType, duration, weightTraining;
      
      // 根據星期安排訓練
      if (dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4) { // 週一三五 - 上肢
        cardioType = cardioTypes[Math.floor(Math.random() * 4)]; // 前4種有氧
        duration = day <= 7 ? 15 : day <= 14 ? 20 : 25;
        weightTraining = '上肢訓練';
      } else if (dayOfWeek === 1 || dayOfWeek === 3) { // 週二四 - 下肢
        cardioType = cardioTypes[Math.floor(Math.random() * 4)]; // 前4種有氧
        duration = day <= 7 ? 15 : day <= 14 ? 20 : 25;
        weightTraining = '下肢訓練';
      } else if (dayOfWeek === 5) { // 週六 - 瑜伽
        cardioType = '瑜伽';
        duration =  day <= 7 ? 20 : day <= 14 ? 25 : 30;
        weightTraining = null;
      } else { // 週日 - 伸展
        cardioType = '伸展';
        duration = 10;
        weightTraining = null;
      }

      data.push({
        day,
        weekday: weekdays[dayOfWeek],
        cardio: {
          type: cardioType,
          duration,
          completed: false
        },
        weights: weightTraining ? {
          type: weightTraining,
          exercises: trainingPlan[weightTraining].reduce((acc, exercise) => {
            acc[exercise] = '';
            return acc;
          }, {}),
          completed: false
        } : null
      });
    }
    return data;
  };

  const [trainingData, setTrainingData] = useState(initializeTrainingData());
  const [selectedDay, setSelectedDay] = useState(calculateCurrentDay());
  const [activeView, setActiveView] = useState('daily'); // 'daily', 'charts', 'stats'

  // 更新有氧完成狀態
  const updateCardioStatus = (day, completed) => {
    setTrainingData(prev => prev.map(item => 
      item.day === day 
        ? { ...item, cardio: { ...item.cardio, completed } }
        : item
    ));
  };

  // 更新重量記錄
  const updateWeight = (day, exercise, weight) => {
    setTrainingData(prev => prev.map(item => {
      if (item.day === day && item.weights) {
        const newExercises = { ...item.weights.exercises, [exercise]: weight };
        const completed = Object.values(newExercises).some(w => w !== '');
        
        return {
          ...item,
          weights: {
            ...item.weights,
            exercises: newExercises,
            completed
          }
        };
      }
      return item;
    }));
  };

  // 計算完成率
  const calculateCompletionRate = () => {
    const totalCardio = trainingData.length;
    const completedCardio = trainingData.filter(item => item.cardio.completed).length;
    
    const totalWeights = trainingData.filter(item => item.weights).length;
    const completedWeights = trainingData.filter(item => item.weights && item.weights.completed).length;
    
    return {
      cardio: totalCardio > 0 ? ((completedCardio / totalCardio) * 100).toFixed(1) : 0,
      weights: totalWeights > 0 ? ((completedWeights / totalWeights) * 100).toFixed(1) : 0,
      overall: totalCardio > 0 ? (((completedCardio + completedWeights) / (totalCardio + totalWeights)) * 100).toFixed(1) : 0
    };
  };

  // 生成重訓進度圖表數據
  const generateProgressData = () => {
    const allExercises = [...trainingPlan.上肢訓練, ...trainingPlan.下肢訓練];
    const exerciseData = {};
    
    allExercises.forEach(exercise => {
      exerciseData[exercise] = [];
    });

    trainingData.forEach(dayData => {
      if (dayData.weights && dayData.weights.exercises) {
        Object.entries(dayData.weights.exercises).forEach(([exercise, weight]) => {
          if (weight && !isNaN(parseFloat(weight))) {
            exerciseData[exercise].push({
              day: dayData.day,
              weight: parseFloat(weight),
              weekday: `第${dayData.day}天`
            });
          }
        });
      }
    });

    return exerciseData;
  };

  // 生成圓餅圖數據
  const generatePieChartData = () => {
    const rates = calculateCompletionRate();
    return [
      { name: '有氧運動', value: parseFloat(rates.cardio), color: '#3B82F6' },
      { name: '重量訓練', value: parseFloat(rates.weights), color: '#10B981' },
      { name: '未完成', value: 100 - parseFloat(rates.overall), color: '#E5E7EB' }
    ];
  };

  const currentDay = trainingData.find(item => item.day === selectedDay);
  const completionRate = calculateCompletionRate();
  const progressData = generateProgressData();
  const pieData = generatePieChartData();

  const exerciseColors = {
    '啞鈴肩推': '#8B5CF6',
    '啞鈴胸推': '#EF4444',
    '啞鈴划船': '#F59E0B',
    '啞鈴側平舉': '#06B6D4',
    '啞鈴硬舉': '#10B981',
    '弓步蹲': '#F97316',
    '臀橋': '#EC4899'
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Dumbbell className="text-blue-600" />
          50天健身追蹤計劃
          <span className="text-lg font-normal text-gray-600">
            (起始日期: 2025/8/11)
          </span>
        </h1>
        
        {/* 導航標籤 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveView('daily')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'daily'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Calendar size={16} className="inline mr-2" />
            每日訓練
          </button>
          <button
            onClick={() => setActiveView('charts')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'charts'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <TrendingUp size={16} className="inline mr-2" />
            重量進度
          </button>
          <button
            onClick={() => setActiveView('stats')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'stats'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <PieChart size={16} className="inline mr-2" />
            完成統計
          </button>
        </div>
        
        {/* 完成率統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Heart size={20} />
              <span className="font-medium">有氧完成率</span>
            </div>
            <div className="text-2xl font-bold">{completionRate.cardio}%</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell size={20} />
              <span className="font-medium">重訓完成率</span>
            </div>
            <div className="text-2xl font-bold">{completionRate.weights}%</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={20} />
              <span className="font-medium">總完成率</span>
            </div>
            <div className="text-2xl font-bold">{completionRate.overall}%</div>
          </div>
        </div>
      </div>

      {/* 每日訓練視圖 */}
      {activeView === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 天數選擇 */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              選擇天數 
              <span className="text-sm font-normal text-blue-600 ml-2">
                (今天是第{calculateCurrentDay()}天)
              </span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-5 gap-2">
                {trainingData.map((item) => {
                  const hasCardio = item.cardio.completed;
                  const hasWeights = item.weights && item.weights.completed;
                  const isSelected = selectedDay === item.day;
                  const isToday = item.day === calculateCurrentDay();
                  
                  return (
                    <button
                      key={item.day}
                      onClick={() => setSelectedDay(item.day)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-500 text-white shadow-lg'
                          : isToday
                          ? 'bg-yellow-100 hover:bg-yellow-200 text-gray-800 border-yellow-400'
                          : 'bg-white hover:bg-blue-50 text-gray-700'
                      } border-2 ${
                        isSelected 
                          ? 'border-blue-500' 
                          : isToday
                          ? 'border-yellow-400'
                          : 'border-gray-200'
                      }`}
                    >
                      <div>第{item.day}天</div>
                      <div className="text-xs opacity-75">
                        週{item.weekday}
                        {isToday && <div className="text-xs font-bold text-yellow-600">今天</div>}
                      </div>
                      <div className="flex justify-center gap-1 mt-1">
                        {hasCardio && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
                        {hasWeights && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 訓練詳情 */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              第{selectedDay}天 - 週{currentDay?.weekday}
            </h3>
            
            <div className="space-y-6">
              {/* 有氧運動 */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Heart className="text-blue-600" />
                  有氧運動
                </h4>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-lg font-medium text-gray-800">
                      {currentDay?.cardio.type}
                    </div>
                    <div className="text-sm text-gray-600">
                      時間: {currentDay?.cardio.duration} 分鐘
                    </div>
                  </div>
                  <button
                    onClick={() => updateCardioStatus(selectedDay, !currentDay?.cardio.completed)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      currentDay?.cardio.completed
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {currentDay?.cardio.completed ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Circle size={20} />
                    )}
                    {currentDay?.cardio.completed ? '已完成' : '未完成'}
                  </button>
                </div>
              </div>

              {/* 重量訓練 */}
              {currentDay?.weights && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <Dumbbell className="text-green-600" />
                    {currentDay.weights.type}
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(currentDay.weights.exercises).map(([exercise, weight]) => (
                      <div key={exercise} className="flex items-center gap-4">
                        <label className="flex-1 text-gray-700 font-medium">
                          {exercise}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={weight}
                            onChange={(e) => updateWeight(selectedDay, exercise, e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="公斤"
                          />
                          <span className="text-sm text-gray-500">kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    狀態: {currentDay.weights.completed ? (
                      <span className="text-green-600 font-medium">已記錄重量</span>
                    ) : (
                      <span className="text-gray-500">尚未記錄</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 重量進度圖表視圖 */}
      {activeView === 'charts' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">重量訓練進度追蹤</h2>
          
          {/* 上肢訓練圖表 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">上肢訓練進度</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: '重量 (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {trainingPlan.上肢訓練.map(exercise => {
                  if (progressData[exercise].length > 0) {
                    return (
                      <Line
                        key={exercise}
                        dataKey="weight"
                        data={progressData[exercise]}
                        stroke={exerciseColors[exercise]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name={exercise}
                      />
                    );
                  }
                  return null;
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 下肢訓練圖表 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">下肢訓練進度</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: '重量 (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {trainingPlan.下肢訓練.map(exercise => {
                  if (progressData[exercise].length > 0) {
                    return (
                      <Line
                        key={exercise}
                        dataKey="weight"
                        data={progressData[exercise]}
                        stroke={exerciseColors[exercise]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name={exercise}
                      />
                    );
                  }
                  return null;
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 個別動作圖表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(progressData).map(([exercise, data]) => {
              if (data.length === 0) return null;
              
              return (
                <div key={exercise} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">{exercise}</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip labelFormatter={(value) => `第${value}天`} />
                      <Line
                        dataKey="weight"
                        stroke={exerciseColors[exercise]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 統計視圖 */}
      {activeView === 'stats' && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">完成度統計</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 圓餅圖 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">整體完成度</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsPieChart>
                  <Pie
                    dataKey="value"
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* 詳細統計 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">詳細數據</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">有氧運動</h4>
                  <div className="text-sm text-gray-600">
                    <p>已完成: {trainingData.filter(item => item.cardio.completed).length} 天</p>
                    <p>總天數: {trainingData.length} 天</p>
                    <p>完成率: {completionRate.cardio}%</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">重量訓練</h4>
                  <div className="text-sm text-gray-600">
                    <p>已完成: {trainingData.filter(item => item.weights && item.weights.completed).length} 天</p>
                    <p>重訓天數: {trainingData.filter(item => item.weights).length} 天</p>
                    <p>完成率: {completionRate.weights}%</p>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">各動作記錄次數</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {Object.entries(progressData).map(([exercise, data]) => (
                      <p key={exercise}>{exercise}: {data.length} 次記錄</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessTracker;
