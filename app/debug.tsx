import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft } from 'lucide-react-native';

interface StorageData {
  [key: string]: string | null;
}

interface WeekDebugInfo {
  currentWeekIndex: number;
  expandedWeeksArray: number[];
  weeklyStatsCount: number;
  dateNow: string;
  weeksInfo?: string[];
}

type MockLocale = 'en' | 'ca';

export default function DebugScreen() {
  const router = useRouter();
  const [storageData, setStorageData] = useState<StorageData>({});
  const [loading, setLoading] = useState(true);
  const [weekDebug, setWeekDebug] = useState<WeekDebugInfo | null>(null);
  const [mockLocale, setMockLocale] = useState<MockLocale>('en');

  useEffect(() => {
    loadAllData();
    calculateWeekDebug();
  }, []);

  const calculateWeekDebug = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstSunday = new Date(firstDay);
    firstSunday.setDate(firstSunday.getDate() - firstDay.getDay());

    let weekIdx = 0;
    let currentWeekStart = new Date(firstSunday);
    let foundWeekIndex = 0;
    const weeksInfo: string[] = [];

    weeksInfo.push(`NOW: ${now.toISOString()} (time: ${now.getTime()})`);
    weeksInfo.push('---');

    while (currentWeekStart <= lastDay) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startStr = currentWeekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];
      const isCurrentWeek = now >= currentWeekStart && now <= weekEnd;
      
      weeksInfo.push(`Week ${weekIdx + 1} (idx ${weekIdx}): ${startStr} - ${endStr}${isCurrentWeek ? ' ⭐ CURRENT' : ''}`);
      weeksInfo.push(`  Start time: ${currentWeekStart.getTime()}, End time: ${weekEnd.getTime()}`);
      weeksInfo.push(`  Check: ${now.getTime()} >= ${currentWeekStart.getTime()} && ${now.getTime()} <= ${weekEnd.getTime()} = ${isCurrentWeek}`);

      if (isCurrentWeek) {
        foundWeekIndex = weekIdx;
      }

      currentWeekStart = new Date(weekEnd);
      currentWeekStart.setDate(currentWeekStart.getDate() + 1);
      weekIdx += 1;
    }

    setWeekDebug({
      currentWeekIndex: foundWeekIndex,
      expandedWeeksArray: [foundWeekIndex],
      weeklyStatsCount: weekIdx,
      dateNow: now.toISOString(),
      weeksInfo,
    } as any);
  };

  const loadAllData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allData: StorageData = {};

      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        allData[key] = value;
      }

      setStorageData(allData);
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      setStorageData({});
      alert('All data cleared!');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const generateMockData = async () => {
    try {
      setLoading(true);

      const formatDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const parseDateKey = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date((year ?? 1970), (month ?? 1) - 1, day ?? 1);
      };

      const addDays = (date: Date, days: number) => {
        const next = new Date(date);
        next.setDate(next.getDate() + days);
        return next;
      };

      const addDaysToKey = (dateStr: string, days: number) => {
        return formatDateKey(addDays(parseDateKey(dateStr), days));
      };

      const toIsoAtHour = (dateStr: string, hour: number) => {
        const date = parseDateKey(dateStr);
        date.setHours(hour, 0, 0, 0);
        return date.toISOString();
      };

      const isNewCalendarWeek = (lastDate: string | null, currentDate: string) => {
        if (!lastDate) return true;

        const getMondayOfWeek = (date: Date) => {
          const d = new Date(date);
          const day = d.getDay();
          const diff = d.getDate() - day + (day === 0 ? -6 : 1);
          return new Date(d.setDate(diff));
        };

        const lastMonday = getMondayOfWeek(parseDateKey(lastDate));
        const currentMonday = getMondayOfWeek(parseDateKey(currentDate));
        return currentMonday.getTime() > lastMonday.getTime();
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayKey = formatDateKey(today);
      const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Start from a clean state to make screenshots reproducible.
      await AsyncStorage.clear();

      const victories = [
        'bed',
        'water',
        'breath',
        'patient',
        'pet',
        'sky',
        'smile',
        'food',
      ];

      const mediaByTopic = {
        pasta: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80',
        kitchen: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80',
        cinema: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
        style: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
        books: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80',
        pottery: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80',
        market: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
        cafeLaptop: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        phoneDesk: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
        soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
        tv: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80',
        skincare: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
        giftBooks: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=1200&q=80',
        travel: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
      };

      type NoteSeed = {
        title: string;
        content: string;
        tags: string[];
        mediaUris: string[];
        audioTitles: string[];
      };

      type LocaleSeedData = {
        morningRoutines: string[];
        eveningRoutines: string[];
        taskIdeas: string[];
        noteSeeds: NoteSeed[];
        successLocaleLabel: string;
      };

      const localeCatalog: Record<MockLocale, LocaleSeedData> = {
        en: {
          morningRoutines: [
            'Warm lemon-honey water',
            'Energizing workout',
            'Great healthy breakfast',
          ],
          eveningRoutines: [
            'Evening self-care',
            'Short plan for tomorrow',
            'Sleep before midnight',
            'No screens before sleep',
          ],
          taskIdeas: [
            'Book annual health check-up',
            'Prepare colorful lunch box',
            'Declutter bedside table',
            'Call a close friend for a check-in',
            'Plan two mindful breaks',
            'Sort photos for gratitude album',
            'Refill water bottle before bed',
            '10-minute evening stretch',
            'Review monthly budget calmly',
            'Write three wins of the day',
            'Replace one sugary snack with fruit',
            'Walk outside for 20 minutes',
            'Clean and reset work desk',
            'Prepare outfit for tomorrow',
            'Backup phone photos to cloud',
            'Set 2 priorities for tomorrow',
            'Read 10 pages before sleep',
            'Meal prep for two days',
            'Reply to one pending email',
            'Deep breathe for 5 minutes',
            'Organize medicine and vitamins',
            'Review weekly goals and progress',
            'Water the plants',
            'Send a thank-you message',
            'Pack gym bag in advance',
            'Update personal notes tags',
            'Schedule focused no-phone hour',
            'Finish laundry cycle',
            'Prepare tea ritual for evening',
            'Track mood in journal',
          ],
          noteSeeds: [
            {
              title: '15-minute pasta that saved Tuesday',
              content: 'One pan, garlic, cherry tomatoes, and frozen peas. Fast, cheap, and surprisingly good. Keep this for low-energy evenings.',
              tags: ['food', 'recipe', 'quick'],
              mediaUris: [mediaByTopic.pasta, mediaByTopic.kitchen],
              audioTitles: ['Voice note: quick dinner steps'],
            },
            {
              title: 'Movies watched this week',
              content: 'Dune: Part Two looked incredible in IMAX, but the pacing was slow in the middle. Perfect Days felt quiet and warm.',
              tags: ['movies', 'review', 'weekend'],
              mediaUris: [mediaByTopic.cinema],
              audioTitles: ['Movie ranking quick take'],
            },
            {
              title: 'Outfit formula for chaotic mornings',
              content: 'Wide jeans + clean tee + structured jacket + one accessory. Works even when I wake up late and have zero brain cells.',
              tags: ['style', 'lifehack', 'routine'],
              mediaUris: [mediaByTopic.style],
              audioTitles: ['Closet combo idea', 'What to buy next'],
            },
            {
              title: 'Book notes worth re-reading',
              content: 'The best reminder this week: make good choices easy by changing the environment first, not by relying on mood.',
              tags: ['books', 'lifehack', 'notes'],
              mediaUris: [mediaByTopic.books],
              audioTitles: ['Book highlights recap'],
            },
            {
              title: 'Interesting places for Saturday',
              content: 'Saved a ceramics studio, a tiny bookstore cafe, and a riverside market. Could make a full day route from this.',
              tags: ['places', 'recommendations', 'weekend'],
              mediaUris: [mediaByTopic.pottery, mediaByTopic.market],
              audioTitles: [],
            },
            {
              title: 'Laptop-friendly cafes with real Wi-Fi',
              content: 'Tested three spots. One had great coffee but unstable internet. The second one was noisy. Third is perfect for deep work.',
              tags: ['places', 'work', 'recommendations'],
              mediaUris: [mediaByTopic.cafeLaptop],
              audioTitles: ['Cafe notes and ratings'],
            },
            {
              title: 'Phone cleanup lifehack',
              content: '30-30 rule: 30 screenshots deleted and 30 photos organized every Sunday. Gallery is finally usable again.',
              tags: ['lifehack', 'digital', 'organization'],
              mediaUris: [mediaByTopic.phoneDesk],
              audioTitles: [],
            },
            {
              title: 'Comfort soup recipe (rain edition)',
              content: 'Roasted pumpkin, garlic, coconut milk, and crispy seeds on top. Freezes well and tastes even better next day.',
              tags: ['food', 'recipe', 'home'],
              mediaUris: [mediaByTopic.soup],
              audioTitles: ['Soup shortcut tips'],
            },
            {
              title: 'Series I dropped after episode 2',
              content: 'Visuals were great, but the script felt empty. Keeping this note so I stop forcing shows just because they are trending.',
              tags: ['movies', 'review', 'opinion'],
              mediaUris: [mediaByTopic.tv],
              audioTitles: [],
            },
            {
              title: 'Style + skincare combo that works',
              content: 'If I prep skincare and outfit together in the evening, mornings are smoother and I actually leave on time.',
              tags: ['style', 'routine', 'self-care'],
              mediaUris: [mediaByTopic.skincare, mediaByTopic.style],
              audioTitles: ['AM prep routine'],
            },
            {
              title: 'Book recommendations to gift',
              content: 'Shortlist: one practical nonfiction, one cozy novel, and one illustrated essay collection. Different vibes, all safe picks.',
              tags: ['books', 'recommendations', 'gifts'],
              mediaUris: [mediaByTopic.giftBooks],
              audioTitles: [],
            },
            {
              title: 'Mini travel plan near the city',
              content: 'Train in the morning, art museum, local bakery, and sunset walk by the old harbor. No car needed.',
              tags: ['places', 'planning', 'recommendations'],
              mediaUris: [mediaByTopic.travel],
              audioTitles: ['Weekend route draft'],
            },
          ],
          successLocaleLabel: 'EN',
        },
        ca: {
          morningRoutines: [
            'Aigua tèbia amb llimona i mel',
            'Entrenament enèrgic curt',
            'Bon esmorzar saludable',
          ],
          eveningRoutines: [
            'Autocura del vespre',
            'Pla curt per a demà',
            'Dormir abans de mitjanit',
            'Sense pantalles abans de dormir',
          ],
          taskIdeas: [
            'Demanar revisió mèdica anual',
            'Preparar una carmanyola de colors',
            'Ordenar la tauleta de nit',
            'Fer una trucada curta a una amiga',
            'Planificar dues pauses conscients',
            'Organitzar fotos de records',
            'Deixar l\'ampolla d\'aigua plena',
            'Fer estiraments de 10 minuts',
            'Revisar el pressupost mensual amb calma',
            'Escriure tres mini victòries del dia',
            'Canviar un snack per fruita',
            'Passejar 20 minuts a l\'aire lliure',
            'Endrear la zona de treball',
            'Deixar preparat el look de demà',
            'Fer còpia de seguretat de fotos',
            'Escollir 2 prioritats per demà',
            'Llegir 10 pàgines abans de dormir',
            'Cuinar per dos dies',
            'Respondre un correu pendent',
            'Respirar profund 5 minuts',
            'Ordenar vitamines i medicació',
            'Revisar objectius setmanals',
            'Regar les plantes',
            'Enviar un missatge d\'agraïment',
            'Preparar la bossa del gimnàs',
            'Revisar etiquetes de les notes',
            'Reservar una hora sense mòbil',
            'Acabar la bugada',
            'Preparar ritual de te del vespre',
            'Apuntar estat d\'ànim al diari',
          ],
          noteSeeds: [
            {
              title: 'Pasta de 15 minuts per salvar el dimarts',
              content: 'Una paella, all, tomàquet cherry i pèsols congelats. Ràpida, barata i molt bona. Recepta per dies de poca energia.',
              tags: ['menjar', 'recepta', 'ràpid'],
              mediaUris: [mediaByTopic.pasta, mediaByTopic.kitchen],
              audioTitles: ['Nota de veu: passos de la recepta'],
            },
            {
              title: 'Pel·lícules d\'aquesta setmana',
              content: 'Dune: Part Two espectacular visualment. Perfect Days molt calmada i bonica. Em quedo amb les dues per motius diferents.',
              tags: ['pel·lícules', 'review', 'cap-de-setmana'],
              mediaUris: [mediaByTopic.cinema],
              audioTitles: ['Rànquing ràpid de pel·lícules'],
            },
            {
              title: 'Fórmula de look per matins de caos',
              content: 'Texans amples + samarreta bàsica + jaqueta estructurada + un accessori. Funciona sempre i estalvia temps.',
              tags: ['estil', 'lifehack', 'rutina'],
              mediaUris: [mediaByTopic.style],
              audioTitles: ['Idea de combinacions d\'armari'],
            },
            {
              title: 'Notes de llibres per rellegir',
              content: 'Recordatori clau: fes fàcil l\'hàbit bo canviant l\'entorn, no confiant en la motivació del moment.',
              tags: ['llibres', 'lifehack', 'notes'],
              mediaUris: [mediaByTopic.books],
              audioTitles: ['Resum de cites del llibre'],
            },
            {
              title: 'Llocs interessants per dissabte',
              content: 'He guardat un taller de ceràmica, una llibreria-cafè i un mercat a prop del riu. Ruta completa en un dia.',
              tags: ['llocs', 'recomanacions', 'cap-de-setmana'],
              mediaUris: [mediaByTopic.pottery, mediaByTopic.market],
              audioTitles: [],
            },
            {
              title: 'Cafeteries amb bon Wi-Fi per treballar',
              content: 'N\'he provat tres. Una amb bon cafè però internet fluix. Una massa sorollosa. La tercera, perfecta per concentrar-me.',
              tags: ['llocs', 'feina', 'recomanacions'],
              mediaUris: [mediaByTopic.cafeLaptop],
              audioTitles: ['Punts forts de cada cafeteria'],
            },
            {
              title: 'Lifehack per netejar el mòbil',
              content: 'Regla 30-30: cada diumenge esborro 30 captures i ordeno 30 fotos. La galeria torna a tenir sentit.',
              tags: ['lifehack', 'digital', 'organització'],
              mediaUris: [mediaByTopic.phoneDesk],
              audioTitles: [],
            },
            {
              title: 'Recepta de crema reconfortant',
              content: 'Carbassa al forn, all, llet de coco i llavors torrades. Congela genial i l\'endemà és encara millor.',
              tags: ['menjar', 'recepta', 'casa'],
              mediaUris: [mediaByTopic.soup],
              audioTitles: ['Trucs ràpids per la crema'],
            },
            {
              title: 'Sèrie que he deixat al capítol 2',
              content: 'Molt bonica visualment però guió buit. Ho deixo escrit per no forçar sèries només per hype.',
              tags: ['pel·lícules', 'review', 'opinió'],
              mediaUris: [mediaByTopic.tv],
              audioTitles: [],
            },
            {
              title: 'Combo estil + skincare que funciona',
              content: 'Si preparo skincare i look al vespre, al matí surto puntual i amb menys estrès.',
              tags: ['estil', 'rutina', 'autocura'],
              mediaUris: [mediaByTopic.skincare, mediaByTopic.style],
              audioTitles: ['Rutina exprés del matí'],
            },
            {
              title: 'Llibres per regalar sense fallar',
              content: 'Llista curta: una no-ficció pràctica, una novel·la acollidora i un llibre il·lustrat. Tres estils segurs.',
              tags: ['llibres', 'recomanacions', 'regals'],
              mediaUris: [mediaByTopic.giftBooks],
              audioTitles: [],
            },
            {
              title: 'Mini escapada a prop de la ciutat',
              content: 'Tren al mat, museu, forn local i passeig al capvespre pel port antic. Sense cotxe, pla perfecte.',
              tags: ['llocs', 'planificacio', 'recomanacions'],
              mediaUris: [mediaByTopic.travel],
              audioTitles: ['Esborrany de ruta del cap de setmana'],
            },
          ],
          successLocaleLabel: 'CA',
        },
      };

      const localeData = localeCatalog[mockLocale];
      const morningRoutinesList = localeData.morningRoutines;
      const eveningRoutinesList = localeData.eveningRoutines;


        const morningRoutineState = morningRoutinesList.map((text, idx) => ({
          id: `m-${idx + 1}`,
          text,
          completed: false,
        }));

        const eveningRoutineState = eveningRoutinesList.map((text, idx) => ({
          id: `e-${idx + 1}`,
          text,
          completed: false,
        }));

        await AsyncStorage.setItem('morningRoutine', JSON.stringify(morningRoutineState));
        await AsyncStorage.setItem('eveningRoutine', JSON.stringify(eveningRoutineState));

        await AsyncStorage.setItem('routines', JSON.stringify({
          morning: morningRoutinesList.map((text) => ({ text, done: false })),
          evening: eveningRoutinesList.map((text) => ({ text, done: false })),
        }));

        await AsyncStorage.setItem('lastProgressDate', todayKey);

        const allDateKeys: string[] = [];
        for (let d = new Date(previousMonthStart); d <= today; d = addDays(d, 1)) {
          allDateKeys.push(formatDateKey(d));
        }

        const progressByDate: Record<string, any> = {};
        const victoriesByDate: Record<string, string[]> = {};

        const forcedMissedIndexes = new Set<number>();
        if (allDateKeys.length > 18) {
          forcedMissedIndexes.add(allDateKeys.length - 18);
          forcedMissedIndexes.add(allDateKeys.length - 17);
        }
        if (allDateKeys.length > 35) {
          forcedMissedIndexes.add(allDateKeys.length - 35);
        }

        type DayMode = 'complete' | 'partial' | 'snoozed' | 'missed';
        const getDayMode = (idx: number): DayMode => {
          if (idx < 3) return 'complete';
          if (forcedMissedIndexes.has(idx)) return 'missed';
          if (idx % 17 === 0 || idx % 23 === 0) return 'missed';
          if (idx % 9 === 0) return 'snoozed';
          if (idx % 4 === 0 || idx % 7 === 0) return 'partial';
          return 'complete';
        };

        const pickVictories = (count: number, seed: number) => {
          const picked: string[] = [];
          const start = seed % victories.length;
          for (let i = 0; i < victories.length && picked.length < count; i += 1) {
            const idx = (start + i * 3) % victories.length;
            const item = victories[idx];
            if (!item || picked.includes(item)) continue;
            picked.push(item);
          }
          return picked;
        };

        for (let i = 0; i < allDateKeys.length; i += 1) {
          const dateKey = allDateKeys[i];
          const mode = getDayMode(i);

          if (mode === 'missed') {
            continue;
          }

          if (mode === 'snoozed') {
            const snoozeProgress = {
              date: dateKey,
              morningTotal: morningRoutinesList.length,
              eveningTotal: eveningRoutinesList.length,
              morningDone: 0,
              eveningDone: 0,
              morningCompleted: false,
              eveningCompleted: false,
              snoozed: true,
              morningRoutines: morningRoutinesList.map((text) => ({ text, completed: false })),
              eveningRoutines: eveningRoutinesList.map((text) => ({ text, completed: false })),
            };
            progressByDate[dateKey] = snoozeProgress;
            await AsyncStorage.setItem(`progress_${dateKey}`, JSON.stringify(snoozeProgress));

            const dayVictories = pickVictories(2, i + 2);
            victoriesByDate[dateKey] = dayVictories;
            await AsyncStorage.setItem(`victories_${dateKey}`, JSON.stringify(dayVictories));
            continue;
          }

          const morningTotal = morningRoutinesList.length;
          const eveningTotal = eveningRoutinesList.length;

          let morningDone = morningTotal;
          let eveningDone = eveningTotal;

          if (mode === 'partial') {
            morningDone = ((i % morningTotal) + 1);
            eveningDone = (((i + 2) % eveningTotal));
            if (morningDone + eveningDone === 0) {
              morningDone = 1;
            }
          }

          const progressData = {
            date: dateKey,
            morningTotal,
            eveningTotal,
            morningDone,
            eveningDone,
            morningCompleted: morningDone === morningTotal,
            eveningCompleted: eveningDone === eveningTotal,
            snoozed: false,
            morningRoutines: morningRoutinesList.map((text, idx) => ({
              text,
              completed: idx < morningDone,
            })),
            eveningRoutines: eveningRoutinesList.map((text, idx) => ({
              text,
              completed: idx < eveningDone,
            })),
          };

          progressByDate[dateKey] = progressData;
          await AsyncStorage.setItem(`progress_${dateKey}`, JSON.stringify(progressData));

          const victoryCount = mode === 'complete' ? 5 + (i % 3) : 3 + (i % 2);
          const dayVictories = pickVictories(victoryCount, i);
          victoriesByDate[dateKey] = dayVictories;
          await AsyncStorage.setItem(`victories_${dateKey}`, JSON.stringify(dayVictories));
        }

        const taskIdeas = localeData.taskIdeas;

        const futureDateKeys: string[] = [];
        for (let d = addDays(today, 1); d <= currentMonthEnd; d = addDays(d, 1)) {
          futureDateKeys.push(formatDateKey(d));
        }

        const tasks: Array<{
          id: string;
          text: string;
          completed: boolean;
          dueDate?: string;
          createdAt: string;
          completedAt?: string;
        }> = [];

        for (let i = 0; i < 36; i += 1) {
          const taskText = taskIdeas[i % taskIdeas.length] || `Mindful task ${i + 1}`;
          const dueDate = allDateKeys[(i * 2 + 3) % allDateKeys.length] || todayKey;
          const pattern = i % 6;

          const baseTask = {
            id: `task-${i + 1}`,
            text: taskText,
            createdAt: toIsoAtHour(addDaysToKey(dueDate, -Math.min(4, (i % 5) + 1)), 9),
          };

          if (pattern === 0 || pattern === 5) {
            tasks.push({
              ...baseTask,
              completed: true,
              dueDate,
              completedAt: dueDate,
            });
            continue;
          }

          if (pattern === 1) {
            const completedAt = addDaysToKey(dueDate, 1);
            const safeCompletedAt = completedAt > todayKey ? todayKey : completedAt;
            tasks.push({
              ...baseTask,
              completed: true,
              dueDate,
              completedAt: safeCompletedAt,
            });
            continue;
          }

          if (pattern === 2) {
            const completedAt = addDaysToKey(dueDate, -1);
            tasks.push({
              ...baseTask,
              completed: true,
              dueDate,
              completedAt,
            });
            continue;
          }

          if (pattern === 3) {
            tasks.push({
              ...baseTask,
              completed: false,
              dueDate,
            });
            continue;
          }

          const futureDueDate = futureDateKeys.length > 0
            ? (futureDateKeys[i % futureDateKeys.length] || todayKey)
            : addDaysToKey(todayKey, (i % 5) + 1);

          tasks.push({
            ...baseTask,
            completed: false,
            dueDate: futureDueDate,
          });
        }

        await AsyncStorage.setItem('oneTimeTasks', JSON.stringify(tasks));

        const audioPool = [
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        ];
        const noteSeeds = localeData.noteSeeds;

        const notes = noteSeeds.map((seed, idx) => {
          const dateKey = allDateKeys[Math.max(0, allDateKeys.length - 1 - idx)] || todayKey;
          const createdAt = toIsoAtHour(dateKey, 11);
          const updatedAt = toIsoAtHour(dateKey, 20);

          const audioClips = seed.audioTitles.map((title, clipIdx) => ({
            id: `note-${idx + 1}-clip-${clipIdx + 1}`,
            uri: audioPool[(idx + clipIdx) % audioPool.length] || audioPool[0] || '',
            title,
            durationMs: 35000 + (idx + clipIdx) * 6000,
            createdAt,
          })).filter((clip) => clip.uri.length > 0);

          return {
            id: `note-${idx + 1}`,
            title: seed.title,
            content: seed.content,
            tags: seed.tags,
            mediaUris: seed.mediaUris,
            audioClips,
            createdAt,
            updatedAt,
          };
        });

        await AsyncStorage.setItem('personalNotes', JSON.stringify(notes));

        const completedTasksByDate: Record<string, number> = {};
        for (const task of tasks) {
          if (!task.completed) continue;
          if (task.completedAt) {
            completedTasksByDate[task.completedAt] = (completedTasksByDate[task.completedAt] || 0) + 1;
          }
          if (task.dueDate) {
            completedTasksByDate[task.dueDate] = (completedTasksByDate[task.dueDate] || 0) + 1;
          }
        }

        let currentStreak = 0;
        let longestStreak = 0;
        let lastActiveDate: string | null = null;
        let freezeDaysAvailable = 1;
        let lastFreezeDate: string | null = null;
        const freezeDates: string[] = [];
        let previousDate: string | null = null;

        for (const dateKey of allDateKeys) {
          if (isNewCalendarWeek(previousDate, dateKey)) {
            freezeDaysAvailable = 1;
          }

          const progress = progressByDate[dateKey];
          const isSnoozed = !!progress?.snoozed;
          const hasRoutineActivity = !!progress && !isSnoozed && ((progress.morningDone || 0) > 0 || (progress.eveningDone || 0) > 0);
          const hasVictoryActivity = (victoriesByDate[dateKey] || []).length > 0;
          const hasTaskActivity = (completedTasksByDate[dateKey] || 0) > 0;
          const hasAnyActivity = hasRoutineActivity || hasVictoryActivity || hasTaskActivity;

          if (hasAnyActivity) {
            currentStreak += 1;
            lastActiveDate = dateKey;
          } else if (isSnoozed) {
            currentStreak += 1;
          } else if (
            currentStreak > 0 &&
            freezeDaysAvailable > 0 &&
            dateKey !== todayKey &&
            lastFreezeDate !== addDaysToKey(dateKey, -1)
          ) {
            freezeDaysAvailable -= 1;
            lastFreezeDate = dateKey;
            freezeDates.push(dateKey);
          } else if (dateKey !== todayKey) {
            currentStreak = 0;
          }

          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }

          previousDate = dateKey;
        }

        const streakData = {
          currentStreak,
          longestStreak,
          lastActiveDate,
          freezeDaysAvailable,
          lastFreezeDate,
          freezeDates,
        };

        await AsyncStorage.setItem('streakData', JSON.stringify(streakData));

        await loadAllData();

        const totalVictories = Object.values(victoriesByDate).reduce((sum, day) => sum + day.length, 0);
        const activeDays = Object.keys(progressByDate).length;
        alert(
          `Store-ready mock data generated (${localeData.successLocaleLabel}):\n` +
          `Months: previous + current\n` +
          `Progress days: ${activeDays}\n` +
          `Victories: ${totalVictories}\n` +
          `Tasks: ${tasks.length}\n` +
          `Notes: ${notes.length}\n` +
          `Freeze days: ${freezeDates.length}`
        );
    } catch (error) {
      console.error('Error generating mock data:', error);
      alert('Error generating data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Debug: LocalStorage</Text>
      </View>

      <View style={styles.localeSwitcher}>
        <Text style={styles.localeLabel}>Seed language</Text>
        <View style={styles.localeButtonsRow}>
          <TouchableOpacity
            style={[styles.localeButton, mockLocale === 'en' && styles.localeButtonActive]}
            onPress={() => setMockLocale('en')}
          >
            <Text style={[styles.localeButtonText, mockLocale === 'en' && styles.localeButtonTextActive]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.localeButton, mockLocale === 'ca' && styles.localeButtonActive]}
            onPress={() => setMockLocale('ca')}
          >
            <Text style={[styles.localeButtonText, mockLocale === 'ca' && styles.localeButtonTextActive]}>CA</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        {/* Week Debug Info */}
        {weekDebug && (
          <View style={[styles.dataItem, { borderLeftColor: '#10B981', marginBottom: 16 }]}>
            <Text style={[styles.keyText, { fontSize: 16, marginBottom: 8 }]}>📅 Week Stats Debug</Text>
            <Text style={styles.debugText}>Date Now: {weekDebug.dateNow}</Text>
            <Text style={styles.debugText}>Current Week Index: {weekDebug.currentWeekIndex}</Text>
            <Text style={styles.debugText}>Expanded Weeks Array: [{weekDebug.expandedWeeksArray.join(', ')}]</Text>
            <Text style={styles.debugText}>Total Weeks in Month: {weekDebug.weeklyStatsCount}</Text>
            {weekDebug.weeksInfo && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.debugText, { fontWeight: '600' }]}>Weeks breakdown:</Text>
                {weekDebug.weeksInfo.map((info, idx) => (
                  <Text key={idx} style={[styles.debugText, { fontSize: 11, marginLeft: 8 }]}>{info}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : Object.keys(storageData).length === 0 ? (
          <Text style={styles.emptyText}>No data stored</Text>
        ) : (
          Object.entries(storageData).map(([key, value]) => (
            <View key={key} style={styles.dataItem}>
              <Text style={styles.keyText}>{key}:</Text>
              <Text style={styles.valueText} selectable>
                {value ? (value.length > 200 ? value.substring(0, 200) + '...' : value) : 'null'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.reloadButton} onPress={loadAllData}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.generateButton} onPress={generateMockData}>
          <Text style={styles.buttonText}>Generate ({mockLocale.toUpperCase()})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearAllData}>
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  localeSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  localeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  localeButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  localeButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
  },
  localeButtonActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#ede9fe',
  },
  localeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  localeButtonTextActive: {
    color: '#6d28d9',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dataItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  keyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
  },
  debugText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  reloadButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
