/**
 * Interactive Gantt Chart Application - Standalone Personal Project Edition
 * Skala Waktu Mingguan, SVG Dependency Lines, LocalStorage Persistence, Task Detail Modal
 */

(function () {
  'use strict';

  // --- Konstanta & Konfigurasi ---
  const STORAGE_KEY = 'ppsdm_gantt_chart_tasks_v2';
  const BANNER_KEY = 'ppsdm_gantt_banner_dismissed';
  const WEEK_UNIT_WIDTH = 130; // Lebar pixel per kolom minggu

  const STATUS_LABELS = {
    not_started: 'Belum Dimulai',
    in_progress: 'Sedang Berjalan',
    completed: 'Selesai',
    on_hold: 'Tertunda'
  };

  const STATUS_COLORS = {
    completed: '#10b981',
    in_progress: '#0284c7',
    not_started: '#64748b',
    on_hold: '#f59e0b'
  };

  const PRIORITY_LABELS = {
    high: 'Tinggi',
    medium: 'Sedang',
    low: 'Rendah'
  };

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const MONTH_NAMES_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  // --- Helper Tanggal ---
  function parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return new Date(dateStr);
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function formatDateISO(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '-';
    const d = parseDate(dateStr);
    if (!d || isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  }

  function calculateDurationDays(startDateStr, endDateStr) {
    const start = parseDate(startDateStr);
    const end = parseDate(endDateStr);
    if (!start || !end) return 1;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  }

  function getStartOfWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Align ke Senin
    d.setDate(diff);
    return d;
  }

  function getRelativeDateStr(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return formatDateISO(d);
  }

  // --- Data Simulasi Awal (Tanpa PIC, Dilengkapi Prioritas & Catatan) ---
  function getDefaultSampleTasks() {
    return [
      {
        id: 'task-1',
        name: 'Analisis Kebutuhan & Spesifikasi Proyek',
        startDate: getRelativeDateStr(-10),
        endDate: getRelativeDateStr(-4),
        progress: 100,
        status: 'completed',
        priority: 'high',
        dependency: '',
        notes: 'Menganalisis arsitektur sistem dan mendefinisikan ruang lingkup pengerjaan.'
      },
      {
        id: 'task-2',
        name: 'Penyusunan Desain Basis Data & Skema Entity',
        startDate: getRelativeDateStr(-3),
        endDate: getRelativeDateStr(2),
        progress: 85,
        status: 'in_progress',
        priority: 'high',
        dependency: 'task-1',
        notes: 'Perancangan ERD dan normalisasi tabel relasi.'
      },
      {
        id: 'task-3',
        name: 'Pengembangan Modul Autentikasi & RBAC',
        startDate: getRelativeDateStr(-1),
        endDate: getRelativeDateStr(6),
        progress: 50,
        status: 'in_progress',
        priority: 'medium',
        dependency: 'task-2',
        notes: 'Implementasi token session dan otorisasi bertingkat.'
      },
      {
        id: 'task-4',
        name: 'Integrasi API & Layanan Eksternal',
        startDate: getRelativeDateStr(3),
        endDate: getRelativeDateStr(12),
        progress: 15,
        status: 'in_progress',
        priority: 'medium',
        dependency: 'task-3',
        notes: 'Sinkronisasi endpoint web service dan response handler.'
      },
      {
        id: 'task-5',
        name: 'Perancangan Antarmuka Pengguna & Komponen UI',
        startDate: getRelativeDateStr(0),
        endDate: getRelativeDateStr(9),
        progress: 30,
        status: 'in_progress',
        priority: 'medium',
        dependency: 'task-2',
        notes: 'Menyusun layout komponen responsif dan navigasi.'
      },
      {
        id: 'task-6',
        name: 'Pengujian Sistem, Linting & Quality Assurance',
        startDate: getRelativeDateStr(10),
        endDate: getRelativeDateStr(18),
        progress: 0,
        status: 'not_started',
        priority: 'high',
        dependency: 'task-4',
        notes: 'Unit test dan verifikasi kestabilan fitur.'
      },
      {
        id: 'task-7',
        name: 'Penyusunan Dokumentasi Teknis & Panduan Pemakaian',
        startDate: getRelativeDateStr(14),
        endDate: getRelativeDateStr(21),
        progress: 0,
        status: 'not_started',
        priority: 'low',
        dependency: 'task-6',
        notes: 'Penyusunan panduan instalasi dan pemeliharaan mandiri.'
      },
      {
        id: 'task-8',
        name: 'Eksplorasi Skrip Otomasi & Backup Rutin',
        startDate: getRelativeDateStr(-6),
        endDate: getRelativeDateStr(-2),
        progress: 40,
        status: 'on_hold',
        priority: 'low',
        dependency: 'task-1',
        notes: 'Tertunda menunggu evaluasi mekanisme sinkronisasi lokal.'
      }
    ];
  }

  // --- State Aplikasi ---
  const state = {
    tasks: [],
    searchQuery: '',
    filterStatus: 'ALL',
    showDependencies: true,
    lastCoords: {},
    editingTaskId: null,
    deletingTaskId: null,
    detailTaskId: null,
    timelineRange: {
      startDate: null,
      endDate: null,
      totalWeeks: 0,
      totalDays: 0
    }
  };

  // --- Elemen DOM ---
  const el = {
    btnToday: document.getElementById('btnToday'),
    btnExport: document.getElementById('btnExport'),
    inputImport: document.getElementById('inputImport'),
    btnResetData: document.getElementById('btnResetData'),
    btnAddTask: document.getElementById('btnAddTask'),
    btnPrevWeek: document.getElementById('btnPrevWeek'),
    btnNextWeek: document.getElementById('btnNextWeek'),

    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    filterStatus: document.getElementById('filterStatus'),
    toggleDependencies: document.getElementById('toggleDependencies'),

    // Ringkasan Progres Proyek
    overallProgressBar: document.getElementById('overallProgressBar'),
    overallPercentage: document.getElementById('overallPercentage'),
    overallTaskStats: document.getElementById('overallTaskStats'),

    // KPI Cards
    statTotal: document.getElementById('statTotal'),
    statProgressAvg: document.getElementById('statProgressAvg'),
    statInProgress: document.getElementById('statInProgress'),
    statCompleted: document.getElementById('statCompleted'),
    statNotStarted: document.getElementById('statNotStarted'),
    statOnHold: document.getElementById('statOnHold'),

    // Gantt Board (Dual Viewport Architecture)
    ganttLeftPane: document.getElementById('ganttLeftPane'),
    taskRowsContainer: document.getElementById('taskRowsContainer'),
    paneDivider: document.getElementById('paneDivider'),
    timelineHeaderViewport: document.getElementById('timelineHeaderViewport'),
    timelineHeader: document.getElementById('timelineHeader'),
    timelineHeaderMonths: document.getElementById('timelineHeaderMonths'),
    timelineHeaderUnits: document.getElementById('timelineHeaderUnits'),
    timelineBodyViewport: document.getElementById('timelineBodyViewport'),
    timelineBody: document.getElementById('timelineBody'),
    timelineGridBg: document.getElementById('timelineGridBg'),
    todayMarkerLine: document.getElementById('todayMarkerLine'),
    dependencySvgLayer: document.getElementById('dependencySvgLayer'),
    timelineBarsContainer: document.getElementById('timelineBarsContainer'),
    emptyState: document.getElementById('emptyState'),

    // Notice Banner
    demoNotice: document.getElementById('demoNotice'),
    btnCloseBanner: document.getElementById('btnCloseBanner'),

    // Task Modal Form
    taskModal: document.getElementById('taskModal'),
    modalTitle: document.getElementById('modalTitle'),
    btnModalClose: document.getElementById('btnModalClose'),
    btnModalCancel: document.getElementById('btnModalCancel'),
    taskForm: document.getElementById('taskForm'),
    taskId: document.getElementById('taskId'),
    taskName: document.getElementById('taskName'),
    taskStatus: document.getElementById('taskStatus'),
    taskPriority: document.getElementById('taskPriority'),
    taskStartDate: document.getElementById('taskStartDate'),
    taskEndDate: document.getElementById('taskEndDate'),
    taskProgress: document.getElementById('taskProgress'),
    progressValueDisplay: document.getElementById('progressValueDisplay'),
    taskDurationPreview: document.getElementById('taskDurationPreview'),
    taskDependency: document.getElementById('taskDependency'),
    taskNotes: document.getElementById('taskNotes'),

    // Detail Task Modal
    detailModal: document.getElementById('detailModal'),
    detailTitle: document.getElementById('detailTitle'),
    detailTaskName: document.getElementById('detailTaskName'),
    detailStatusBadge: document.getElementById('detailStatusBadge'),
    detailPriorityBadge: document.getElementById('detailPriorityBadge'),
    detailDates: document.getElementById('detailDates'),
    detailDuration: document.getElementById('detailDuration'),
    detailProgressText: document.getElementById('detailProgressText'),
    detailProgressBar: document.getElementById('detailProgressBar'),
    detailDependency: document.getElementById('detailDependency'),
    detailNotes: document.getElementById('detailNotes'),
    btnDetailClose: document.getElementById('btnDetailClose'),
    btnDetailCancel: document.getElementById('btnDetailCancel'),
    btnDetailEdit: document.getElementById('btnDetailEdit'),

    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteTaskTitle: document.getElementById('deleteTaskTitle'),
    btnDeleteClose: document.getElementById('btnDeleteClose'),
    btnDeleteCancel: document.getElementById('btnDeleteCancel'),
    btnDeleteConfirm: document.getElementById('btnDeleteConfirm'),

    // Toast & Tooltip
    saveToast: document.getElementById('saveToast'),
    saveToastMsg: document.getElementById('saveToastMsg'),
    tooltip: document.getElementById('ganttTooltip')
  };

  // --- Notifikasi Toast Non-Intrusif ---
  let toastTimer = null;
  function showToast(message = 'Perubahan tersimpan otomatis') {
    if (!el.saveToast) return;
    el.saveToastMsg.textContent = message;
    el.saveToast.style.display = 'flex';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.saveToast.style.display = 'none';
    }, 2200);
  }

  // --- Penyimpanan (Persistence) & Migrasi Aman ---
  function loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const raw = JSON.parse(saved);
        // Pastikan kompatibilitas schema: default priority & notes jika belum ada
        state.tasks = (Array.isArray(raw) ? raw : (raw.tasks || [])).map(t => ({
          ...t,
          priority: t.priority || 'medium',
          notes: t.notes || ''
        }));
      } else {
        state.tasks = getDefaultSampleTasks();
        saveTasks(false);
      }
    } catch (e) {
      console.warn('Gagal membaca localStorage, memuat data contoh:', e);
      state.tasks = getDefaultSampleTasks();
    }
  }

  function saveTasks(notify = true) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
      if (notify) {
        showToast('Perubahan tersimpan otomatis');
      }
    } catch (e) {
      console.error('Gagal menyimpan ke localStorage:', e);
    }
  }

  // --- Filter & Pencarian (Fokus Nama Task) ---
  function getFilteredTasks() {
    return state.tasks.filter(task => {
      if (state.filterStatus !== 'ALL' && task.status !== state.filterStatus) {
        return false;
      }
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase();
        if (!(task.name || '').toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }

  // --- Ringkasan Proyek & KPI ---
  function updateProjectSummaries() {
    const total = state.tasks.length;
    const inProgress = state.tasks.filter(t => t.status === 'in_progress').length;
    const completed = state.tasks.filter(t => t.status === 'completed').length;
    const notStarted = state.tasks.filter(t => t.status === 'not_started').length;
    const onHold = state.tasks.filter(t => t.status === 'on_hold').length;

    const avgProgress = total > 0 
      ? Math.round(state.tasks.reduce((acc, t) => acc + (Number(t.progress) || 0), 0) / total) 
      : 0;

    // Update Progres Proyek Keseluruhan
    el.overallProgressBar.style.width = `${avgProgress}%`;
    el.overallPercentage.textContent = `${avgProgress}%`;
    el.overallTaskStats.textContent = `${completed} dari ${total} task selesai • Rata-rata: ${avgProgress}%`;

    // Update KPI Cards
    el.statTotal.textContent = total;
    el.statInProgress.textContent = inProgress;
    el.statCompleted.textContent = completed;
    el.statNotStarted.textContent = notStarted;
    el.statOnHold.textContent = onHold;
    el.statProgressAvg.textContent = `${avgProgress}% Rata-rata`;
  }

  // --- Kalkulasi Rentang Waktu (Skala Mingguan Saja) ---
  function computeWeeklyTimelineRange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let minDate = new Date(today);
    let maxDate = new Date(today);

    if (state.tasks.length > 0) {
      state.tasks.forEach(task => {
        const start = parseDate(task.startDate);
        const end = parseDate(task.endDate);
        if (start && start < minDate) minDate = new Date(start);
        if (end && end > maxDate) maxDate = new Date(end);
      });
    }

    // Buffer minggu agar timeline leluasa untuk scroll
    minDate.setDate(minDate.getDate() - 14);
    maxDate.setDate(maxDate.getDate() + 21);

    // Selaraskan awal timeline ke hari Senin terdekat
    const alignedStart = getStartOfWeek(minDate);

    // Hitung total minggu
    const diffDays = Math.ceil((maxDate.getTime() - alignedStart.getTime()) / (1000 * 3600 * 24));
    const totalWeeks = Math.max(Math.ceil(diffDays / 7) + 2, 6);

    const alignedEnd = new Date(alignedStart);
    alignedEnd.setDate(alignedStart.getDate() + (totalWeeks * 7));

    state.timelineRange = {
      startDate: alignedStart,
      endDate: alignedEnd,
      totalWeeks: totalWeeks,
      totalDays: totalWeeks * 7
    };
  }

  function getPixelOffsetForDate(date) {
    const { startDate } = state.timelineRange;
    if (!startDate || !date) return 0;
    const diffDays = (date.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    return (diffDays / 7) * WEEK_UNIT_WIDTH;
  }

  function getPixelWidthForDays(numDays) {
    return (numDays / 7) * WEEK_UNIT_WIDTH;
  }

  function getTotalTimelinePixelWidth() {
    return state.timelineRange.totalWeeks * WEEK_UNIT_WIDTH;
  }

  // --- Render Header & Grid Timeline Mingguan ---
  function renderWeeklyTimelineHeaderAndGrid() {
    const { startDate, totalWeeks } = state.timelineRange;
    const monthsContainer = el.timelineHeaderMonths;
    const unitsContainer = el.timelineHeaderUnits;
    const gridBg = el.timelineGridBg;

    monthsContainer.innerHTML = '';
    unitsContainer.innerHTML = '';
    gridBg.innerHTML = '';

    const totalWidth = getTotalTimelinePixelWidth();
    el.timelineHeader.style.width = `${totalWidth}px`;
    monthsContainer.style.width = `${totalWidth}px`;
    unitsContainer.style.width = `${totalWidth}px`;
    el.timelineBody.style.width = `${totalWidth}px`;
    gridBg.style.width = `${totalWidth}px`;
    el.timelineBarsContainer.style.width = `${totalWidth}px`;

    // Pastikan scroll horizontal header selalu sinkron dengan body
    if (el.timelineHeaderViewport && el.timelineBodyViewport) {
      el.timelineHeaderViewport.scrollLeft = el.timelineBodyViewport.scrollLeft;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Array penampung segmen bulan
    const monthSegments = [];
    let curMonthKey = null;
    let curMonthName = '';
    let curYear = 0;
    let curWeekCount = 0;

    for (let w = 0; w < totalWeeks; w++) {
      const weekStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + (w * 7));
      const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);

      const isCurrentWeek = (today >= weekStart && today <= weekEnd);

      const startStr = `${weekStart.getDate()} ${MONTH_NAMES_SHORT[weekStart.getMonth()]}`;
      const endStr = `${weekEnd.getDate()} ${MONTH_NAMES_SHORT[weekEnd.getMonth()]}`;
      const weekRangeLabel = `${startStr} – ${endStr}`;

      // Header Unit Cell
      const unitCell = document.createElement('div');
      unitCell.className = `header-unit-cell ${isCurrentWeek ? 'current-week-header' : ''}`;
      unitCell.style.width = `${WEEK_UNIT_WIDTH}px`;
      unitCell.textContent = weekRangeLabel;
      unitCell.title = `Minggu: ${weekRangeLabel} ${weekStart.getFullYear()}`;
      unitsContainer.appendChild(unitCell);

      // Grid Kolom Vertikal
      const gridCol = document.createElement('div');
      gridCol.className = `grid-col ${isCurrentWeek ? 'current-week-col' : ''}`;
      gridCol.style.width = `${WEEK_UNIT_WIDTH}px`;
      gridBg.appendChild(gridCol);

      // Tentukan bulan dominan untuk minggu ini (Kamis / tengah minggu)
      const midWeek = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 3);
      const m = midWeek.getMonth();
      const y = midWeek.getFullYear();
      const monthKey = `${y}-${m}`;

      if (monthKey !== curMonthKey) {
        if (curMonthKey !== null) {
          monthSegments.push({
            name: `${curMonthName} ${curYear}`,
            weeks: curWeekCount
          });
        }
        curMonthKey = monthKey;
        curMonthName = MONTH_NAMES[m];
        curYear = y;
        curWeekCount = 1;
      } else {
        curWeekCount++;
      }
    }

    if (curMonthKey !== null) {
      monthSegments.push({
        name: `${curMonthName} ${curYear}`,
        weeks: curWeekCount
      });
    }

    // Render baris bulan di atas
    monthSegments.forEach(seg => {
      const monthCell = document.createElement('div');
      monthCell.className = 'header-month-cell';
      monthCell.style.width = `${seg.weeks * WEEK_UNIT_WIDTH}px`;
      monthCell.textContent = seg.name;
      monthsContainer.appendChild(monthCell);
    });

    // Posisikan Penanda Tanggal Hari Ini Presisi
    updateTodayMarkerPosition();
  }

  function updateTodayMarkerPosition() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { startDate, endDate } = state.timelineRange;

    if (today >= startDate && today <= endDate) {
      const leftPos = getPixelOffsetForDate(today);
      el.todayMarkerLine.style.display = 'block';
      el.todayMarkerLine.style.left = `${leftPos}px`;
    } else {
      el.todayMarkerLine.style.display = 'none';
    }
  }

  // --- Render Keseluruhan Komponen ---
  function renderAll() {
    updateProjectSummaries();

    const filteredTasks = getFilteredTasks();
    computeWeeklyTimelineRange();
    renderWeeklyTimelineHeaderAndGrid();

    el.taskRowsContainer.innerHTML = '';
    el.timelineBarsContainer.innerHTML = '';

    if (filteredTasks.length === 0) {
      el.emptyState.style.display = 'block';
      el.dependencySvgLayer.innerHTML = '';
      return;
    } else {
      el.emptyState.style.display = 'none';
    }

    const taskBarCoords = {}; // Koordinat tengah untuk panah dependensi

    filteredTasks.forEach((task, index) => {
      const taskStart = parseDate(task.startDate);
      const duration = calculateDurationDays(task.startDate, task.endDate);

      // 1. Render Baris Tabel Sisi Kiri (Tanpa Kolom PIC)
      const row = document.createElement('div');
      row.className = 'task-row';
      row.dataset.taskId = task.id;

      const colorDot = STATUS_COLORS[task.status] || '#64748b';

      row.innerHTML = `
        <div class="col col-title task-title-cell" title="${escapeHtml(task.name)} (Klik untuk melihat detail)">
          <span class="task-color-dot" style="background-color: ${colorDot};"></span>
          <span class="task-name-text">${escapeHtml(task.name)}</span>
        </div>
        <div class="col col-dates task-dates-cell" title="${formatDateDisplay(task.startDate)} s/d ${formatDateDisplay(task.endDate)}">
          <div>${formatDateDisplay(task.startDate)}</div>
          <span class="task-duration-badge">${duration} hari</span>
        </div>
        <div class="col col-progress task-progress-cell">
          ${task.progress}%
        </div>
        <div class="col col-actions task-actions-cell">
          <button type="button" class="action-icon-btn edit-btn" title="Edit Task" data-action="edit" data-id="${task.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button type="button" class="action-icon-btn delete-btn" title="Hapus Task" data-action="delete" data-id="${task.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      el.taskRowsContainer.appendChild(row);

      // 2. Render Baris Bar Sisi Kanan (Timeline)
      const timelineRow = document.createElement('div');
      timelineRow.className = 'timeline-row';
      timelineRow.dataset.taskId = task.id;

      // Kalkulasi Posisi Bar Presisi Hari di Dalam Kolom Minggu
      const startOffset = getPixelOffsetForDate(taskStart);
      const barWidth = Math.max(getPixelWidthForDays(duration), 16);

      const barWrapper = document.createElement('div');
      barWrapper.className = `gantt-bar-wrapper bar-${task.status}`;
      barWrapper.style.left = `${startOffset}px`;
      barWrapper.style.width = `${barWidth}px`;
      barWrapper.dataset.taskId = task.id;
      barWrapper.setAttribute('title', `${task.name} (${task.progress}%) - Klik untuk detail`);

      // Fill Progress Bar
      const progressFill = document.createElement('div');
      progressFill.className = 'gantt-bar-fill';
      progressFill.style.width = `${Math.min(Math.max(task.progress, 0), 100)}%`;
      barWrapper.appendChild(progressFill);

      // Label teks pada bar
      if (barWidth >= 70) {
        const barLabel = document.createElement('span');
        barLabel.className = 'gantt-bar-label';
        barLabel.textContent = `${task.name} (${task.progress}%)`;
        barWrapper.appendChild(barLabel);
      } else {
        const outsideLabel = document.createElement('span');
        outsideLabel.className = 'bar-label-outside';
        outsideLabel.style.left = `${startOffset + barWidth + 8}px`;
        outsideLabel.textContent = `${task.name} (${task.progress}%)`;
        timelineRow.appendChild(outsideLabel);
      }

      // Simpan koordinat tengah bar untuk garis dependensi
      const rowHeight = 44;
      const barY = (index * rowHeight) + (rowHeight / 2);
      taskBarCoords[task.id] = {
        startX: startOffset,
        endX: startOffset + barWidth,
        y: barY
      };

      timelineRow.appendChild(barWrapper);
      el.timelineBarsContainer.appendChild(timelineRow);

      // Event Hover & Klik
      setupRowInteractions(row, timelineRow, task);
    });

    state.lastCoords = taskBarCoords;

    // Render Garis Dependensi SVG
    renderDependencyLines(filteredTasks, taskBarCoords);
  }

  // --- Garis Dependensi SVG Antar-Task (Kurva Halus & Rapi) ---
  function renderDependencyLines(tasks, coords) {
    const svg = el.dependencySvgLayer;
    svg.innerHTML = '';
    if (!state.showDependencies) return;

    const totalWidth = getTotalTimelinePixelWidth();
    const totalHeight = Math.max(tasks.length * 44, 400);
    svg.setAttribute('width', totalWidth);
    svg.setAttribute('height', totalHeight);
    svg.style.width = `${totalWidth}px`;
    svg.style.height = `${totalHeight}px`;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
      </marker>
    `;
    svg.appendChild(defs);

    tasks.forEach(task => {
      if (task.dependency && coords[task.dependency] && coords[task.id]) {
        const source = coords[task.dependency];
        const target = coords[task.id];

        const x1 = source.endX;
        const y1 = source.y;
        const x2 = target.startX;
        const y2 = target.y;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        let d;
        if (x2 >= x1 + 10) {
          // Standard case: task berikutnya dimulai setelah task prasyarat selesai
          const dx = Math.min((x2 - x1) * 0.45, 45);
          d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
        } else {
          // Overlapping case: tanggal target bersamaan atau sebelum task sumber selesai
          const yMid = y1 + (y2 > y1 ? 18 : -18);
          d = `M ${x1} ${y1} C ${x1 + 18} ${y1}, ${x1 + 18} ${yMid}, ${Math.min(x1, x2) - 16} ${yMid} S ${x2 - 12} ${y2}, ${x2} ${y2}`;
        }

        path.setAttribute('d', d);
        path.setAttribute('class', 'dep-line');
        path.setAttribute('marker-end', 'url(#arrow)');
        svg.appendChild(path);
      }
    });
  }

  // --- Interaksi Baris, Tooltip & Klik Detail ---
  function setupRowInteractions(rowEl, timelineRowEl, task) {
    const handleMouseEnter = (e) => {
      rowEl.classList.add('highlighted');
      timelineRowEl.classList.add('highlighted');
      showTooltip(e, task);
    };

    const handleMouseLeave = () => {
      rowEl.classList.remove('highlighted');
      timelineRowEl.classList.remove('highlighted');
      hideTooltip();
    };

    const handleMouseMove = (e) => {
      moveTooltip(e);
    };

    rowEl.addEventListener('mouseenter', handleMouseEnter);
    rowEl.addEventListener('mouseleave', handleMouseLeave);
    rowEl.addEventListener('mousemove', handleMouseMove);

    // Klik pada baris tabel (selain tombol aksi) membuka Detail Modal
    rowEl.addEventListener('click', (e) => {
      if (!e.target.closest('.action-icon-btn')) {
        openTaskDetailModal(task.id);
      }
    });

    const barWrapper = timelineRowEl.querySelector('.gantt-bar-wrapper');
    if (barWrapper) {
      barWrapper.addEventListener('mouseenter', handleMouseEnter);
      barWrapper.addEventListener('mouseleave', handleMouseLeave);
      barWrapper.addEventListener('mousemove', handleMouseMove);

      // Klik bar task untuk menampilkan Detail Task
      barWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        openTaskDetailModal(task.id);
      });
    }
  }

  function showTooltip(e, task) {
    const duration = calculateDurationDays(task.startDate, task.endDate);
    const parentTask = state.tasks.find(t => t.id === task.dependency);
    const depName = parentTask ? parentTask.name : 'Tidak ada';

    el.tooltip.innerHTML = `
      <div class="tooltip-title">${escapeHtml(task.name)}</div>
      <div class="tooltip-row"><span class="tooltip-key">Status:</span><span class="tooltip-val">${STATUS_LABELS[task.status] || task.status}</span></div>
      <div class="tooltip-row"><span class="tooltip-key">Prioritas:</span><span class="tooltip-val">${PRIORITY_LABELS[task.priority] || 'Sedang'}</span></div>
      <div class="tooltip-row"><span class="tooltip-key">Jadwal:</span><span class="tooltip-val">${formatDateDisplay(task.startDate)} – ${formatDateDisplay(task.endDate)}</span></div>
      <div class="tooltip-row"><span class="tooltip-key">Durasi:</span><span class="tooltip-val">${duration} Hari</span></div>
      <div class="tooltip-row"><span class="tooltip-key">Progres:</span><span class="tooltip-val">${task.progress}%</span></div>
      <div class="tooltip-row"><span class="tooltip-key">Prasyarat:</span><span class="tooltip-val">${escapeHtml(depName)}</span></div>
    `;
    el.tooltip.style.display = 'block';
    moveTooltip(e);
  }

  function moveTooltip(e) {
    const pad = 14;
    let x = e.clientX + pad;
    let y = e.clientY + pad;

    const tooltipWidth = el.tooltip.offsetWidth;
    const tooltipHeight = el.tooltip.offsetHeight;

    if (x + tooltipWidth > window.innerWidth - 10) {
      x = e.clientX - tooltipWidth - pad;
    }
    if (y + tooltipHeight > window.innerHeight - 10) {
      y = e.clientY - tooltipHeight - pad;
    }

    el.tooltip.style.left = `${x}px`;
    el.tooltip.style.top = `${y}px`;
  }

  function hideTooltip() {
    el.tooltip.style.display = 'none';
  }

  // --- Sinkronisasi Scroll Vertikal & Horizontal (Dual Viewport Architecture) ---
  function setupScrollSync() {
    let isSyncingLeft = false;
    let isSyncingRight = false;

    // Horizontal & vertical scroll on body viewport
    el.timelineBodyViewport.addEventListener('scroll', () => {
      // Direct horizontal synchronization to header viewport
      el.timelineHeaderViewport.scrollLeft = el.timelineBodyViewport.scrollLeft;

      // Vertical synchronization to left task table
      if (!isSyncingRight) {
        isSyncingLeft = true;
        el.taskRowsContainer.scrollTop = el.timelineBodyViewport.scrollTop;
      }
      isSyncingRight = false;
    }, { passive: true });

    // Vertical scroll on left task table
    el.taskRowsContainer.addEventListener('scroll', () => {
      if (!isSyncingLeft) {
        isSyncingRight = true;
        el.timelineBodyViewport.scrollTop = el.taskRowsContainer.scrollTop;
      }
      isSyncingLeft = false;
    }, { passive: true });
  }

  // --- Navigasi Timeline Mingguan ---
  function scrollToToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { startDate, endDate } = state.timelineRange;

    if (today < startDate || today > endDate) {
      alert('Tanggal hari ini berada di luar rentang jadwal proyek.');
      return;
    }

    const todayX = getPixelOffsetForDate(today);
    const containerWidth = el.timelineBodyViewport.clientWidth;
    el.timelineBodyViewport.scrollTo({
      left: Math.max(0, todayX - (containerWidth / 2)),
      behavior: 'smooth'
    });
  }

  function scrollWeeks(deltaWeeks) {
    el.timelineBodyViewport.scrollBy({
      left: deltaWeeks * WEEK_UNIT_WIDTH,
      behavior: 'smooth'
    });
  }

  // --- Modal Detail Task (Saat Bar Diklik) ---
  function openTaskDetailModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    state.detailTaskId = taskId;
    const duration = calculateDurationDays(task.startDate, task.endDate);
    const parentTask = state.tasks.find(t => t.id === task.dependency);

    el.detailTaskName.textContent = task.name;
    
    // Status Badge
    el.detailStatusBadge.textContent = STATUS_LABELS[task.status] || task.status;
    el.detailStatusBadge.className = `badge badge-status-${task.status}`;

    // Priority Badge
    const priority = task.priority || 'medium';
    el.detailPriorityBadge.textContent = `Prioritas ${PRIORITY_LABELS[priority] || 'Sedang'}`;
    el.detailPriorityBadge.className = `badge badge-priority-${priority}`;

    el.detailDates.textContent = `${formatDateDisplay(task.startDate)} s/d ${formatDateDisplay(task.endDate)}`;
    el.detailDuration.textContent = `${duration} Hari`;
    el.detailProgressText.textContent = `${task.progress}%`;
    el.detailProgressBar.style.width = `${task.progress}%`;
    el.detailDependency.textContent = parentTask ? parentTask.name : 'Tidak ada (Dapat langsung dimulai)';
    el.detailNotes.textContent = task.notes && task.notes.trim() ? task.notes : 'Tidak ada catatan tambahan.';

    el.detailModal.style.display = 'flex';
  }

  function closeTaskDetailModal() {
    el.detailModal.style.display = 'none';
    state.detailTaskId = null;
  }

  // --- Modal Form CRUD Task ---
  function populateDependencyDropdown(currentTaskId) {
    el.taskDependency.innerHTML = '<option value="">-- Tanpa Dependensi --</option>';
    state.tasks.forEach(task => {
      if (task.id !== currentTaskId) {
        const opt = document.createElement('option');
        opt.value = task.id;
        opt.textContent = task.name;
        el.taskDependency.appendChild(opt);
      }
    });
  }

  function updateFormDurationDisplay() {
    const start = el.taskStartDate.value;
    const end = el.taskEndDate.value;
    if (start && end) {
      const dur = calculateDurationDays(start, end);
      el.taskDurationPreview.value = `${dur} Hari`;
    } else {
      el.taskDurationPreview.value = '-';
    }
  }

  function openAddTaskModal() {
    state.editingTaskId = null;
    el.modalTitle.textContent = 'Tambah Task Baru';
    el.taskForm.reset();
    el.taskId.value = '';

    const todayStr = formatDateISO(new Date());
    const weekAfterStr = getRelativeDateStr(7);
    el.taskStartDate.value = todayStr;
    el.taskEndDate.value = weekAfterStr;
    el.taskProgress.value = 0;
    el.progressValueDisplay.textContent = '0%';
    el.taskStatus.value = 'not_started';
    el.taskPriority.value = 'medium';
    el.taskNotes.value = '';

    populateDependencyDropdown(null);
    updateFormDurationDisplay();

    el.taskModal.style.display = 'flex';
    el.taskName.focus();
  }

  function openEditTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    state.editingTaskId = taskId;
    el.modalTitle.textContent = 'Edit Task';
    el.taskId.value = task.id;
    el.taskName.value = task.name;
    el.taskStatus.value = task.status;
    el.taskPriority.value = task.priority || 'medium';
    el.taskStartDate.value = task.startDate;
    el.taskEndDate.value = task.endDate;
    el.taskProgress.value = task.progress;
    el.progressValueDisplay.textContent = `${task.progress}%`;
    el.taskNotes.value = task.notes || '';

    populateDependencyDropdown(task.id);
    el.taskDependency.value = task.dependency || '';
    updateFormDurationDisplay();

    el.taskModal.style.display = 'flex';
    el.taskName.focus();
  }

  function closeTaskModal() {
    el.taskModal.style.display = 'none';
  }

  function handleTaskFormSubmit(e) {
    e.preventDefault();

    const id = el.taskId.value;
    const name = el.taskName.value.trim();
    const status = el.taskStatus.value;
    const priority = el.taskPriority.value;
    const startDate = el.taskStartDate.value;
    const endDate = el.taskEndDate.value;
    const progress = parseInt(el.taskProgress.value, 10) || 0;
    const dependency = el.taskDependency.value;
    const notes = el.taskNotes.value.trim();

    if (!name || !startDate || !endDate) {
      alert('Mohon lengkapi nama task, tanggal mulai, dan tanggal selesai.');
      return;
    }

    if (parseDate(startDate) > parseDate(endDate)) {
      alert('Tanggal mulai tidak boleh melebihi tanggal selesai.');
      return;
    }

    if (id) {
      const index = state.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          name,
          status,
          priority,
          startDate,
          endDate,
          progress,
          dependency,
          notes
        };
      }
    } else {
      const newId = 'task-' + Date.now();
      state.tasks.push({
        id: newId,
        name,
        status,
        priority,
        startDate,
        endDate,
        progress,
        dependency,
        notes
      });
    }

    saveTasks(true);
    closeTaskModal();
    renderAll();
  }

  // --- Modal Konfirmasi Hapus ---
  function openDeleteConfirmModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    state.deletingTaskId = taskId;
    el.deleteTaskTitle.textContent = `"${task.name}"`;
    el.deleteModal.style.display = 'flex';
  }

  function closeDeleteModal() {
    el.deleteModal.style.display = 'none';
    state.deletingTaskId = null;
  }

  function executeDeleteTask() {
    if (!state.deletingTaskId) return;

    const idToDelete = state.deletingTaskId;
    state.tasks = state.tasks
      .filter(t => t.id !== idToDelete)
      .map(t => {
        if (t.dependency === idToDelete) {
          return { ...t, dependency: '' };
        }
        return t;
      });

    saveTasks(true);
    closeDeleteModal();
    if (state.detailTaskId === idToDelete) {
      closeTaskDetailModal();
    }
    renderAll();
  }

  // --- Ekspor & Impor Data JSON ---
  function exportDataAsJson() {
    const exportPayload = {
      app: 'PPSDM-HRIS-Gantt-Chart-Personal',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      tasks: state.tasks
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `gantt-chart-data-${formatDateISO(new Date())}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('File JSON berhasil diekspor');
  }

  function importDataFromJson(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        const importedTasks = Array.isArray(parsed) ? parsed : (parsed.tasks || []);

        if (Array.isArray(importedTasks) && importedTasks.length > 0) {
          if (confirm(`Ditemukan ${importedTasks.length} task pada file. Data saat ini akan digantikan dengan data baru. Lanjutkan impor?`)) {
            state.tasks = importedTasks.map(t => ({
              ...t,
              priority: t.priority || 'medium',
              notes: t.notes || ''
            }));
            saveTasks(true);
            renderAll();
            showToast('Data berhasil diimpor!');
          }
        } else {
          alert('Format file JSON tidak valid atau data task kosong.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + err.message);
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  function resetToDefaultData() {
    if (confirm('Kembalikan seluruh task ke data contoh awal? Perubahan saat ini akan digantikan.')) {
      state.tasks = getDefaultSampleTasks();
      saveTasks(true);
      renderAll();
    }
  }

  // --- Resizable Divider ---
  function setupPaneDivider() {
    let isDragging = false;

    el.paneDivider.addEventListener('mousedown', () => {
      isDragging = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const containerRect = document.getElementById('ganttContainer').getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      if (newWidth >= 280 && newWidth <= 650) {
        el.ganttLeftPane.style.width = `${newWidth}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  // --- Event Listeners Binding ---
  function bindEvents() {
    el.btnToday.addEventListener('click', scrollToToday);
    el.btnExport.addEventListener('click', exportDataAsJson);
    el.inputImport.addEventListener('change', importDataFromJson);
    el.btnResetData.addEventListener('click', resetToDefaultData);
    el.btnAddTask.addEventListener('click', openAddTaskModal);

    // Navigasi Minggu Sebelumnya & Berikutnya (1 minggu per klik)
    el.btnPrevWeek.addEventListener('click', () => scrollWeeks(-1));
    el.btnNextWeek.addEventListener('click', () => scrollWeeks(1));

    // Toggle Garis Dependensi
    if (el.toggleDependencies) {
      el.toggleDependencies.addEventListener('change', (e) => {
        state.showDependencies = e.target.checked;
        renderDependencyLines(getFilteredTasks(), state.lastCoords || {});
      });
    }

    // Banner Notice
    el.btnCloseBanner.addEventListener('click', () => {
      el.demoNotice.style.display = 'none';
      try { sessionStorage.setItem(BANNER_KEY, 'true'); } catch (e) {}
    });

    if (sessionStorage.getItem(BANNER_KEY) === 'true') {
      el.demoNotice.style.display = 'none';
    }

    // Filter & Search
    el.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      el.btnClearSearch.style.display = state.searchQuery ? 'block' : 'none';
      renderAll();
    });

    el.btnClearSearch.addEventListener('click', () => {
      state.searchQuery = '';
      el.searchInput.value = '';
      el.btnClearSearch.style.display = 'none';
      renderAll();
    });

    el.filterStatus.addEventListener('change', (e) => {
      state.filterStatus = e.target.value;
      renderAll();
    });

    // Delegasi Klik Aksi pada Tabel Kiri
    el.taskRowsContainer.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-action="edit"]');
      const deleteBtn = e.target.closest('[data-action="delete"]');

      if (editBtn) {
        e.stopPropagation();
        openEditTaskModal(editBtn.dataset.id);
      } else if (deleteBtn) {
        e.stopPropagation();
        openDeleteConfirmModal(deleteBtn.dataset.id);
      }
    });

    // Modal Form Events
    el.btnModalClose.addEventListener('click', closeTaskModal);
    el.btnModalCancel.addEventListener('click', closeTaskModal);
    el.taskForm.addEventListener('submit', handleTaskFormSubmit);

    el.taskProgress.addEventListener('input', (e) => {
      el.progressValueDisplay.textContent = `${e.target.value}%`;
      const val = parseInt(e.target.value, 10);
      if (val === 100) {
        el.taskStatus.value = 'completed';
      } else if (val === 0 && el.taskStatus.value === 'completed') {
        el.taskStatus.value = 'not_started';
      } else if (val > 0 && el.taskStatus.value === 'not_started') {
        el.taskStatus.value = 'in_progress';
      }
    });

    el.taskStartDate.addEventListener('change', updateFormDurationDisplay);
    el.taskEndDate.addEventListener('change', updateFormDurationDisplay);

    // Detail Modal Events
    el.btnDetailClose.addEventListener('click', closeTaskDetailModal);
    el.btnDetailCancel.addEventListener('click', closeTaskDetailModal);
    el.btnDetailEdit.addEventListener('click', () => {
      const taskId = state.detailTaskId;
      closeTaskDetailModal();
      if (taskId) {
        openEditTaskModal(taskId);
      }
    });

    // Modal Delete Events
    el.btnDeleteClose.addEventListener('click', closeDeleteModal);
    el.btnDeleteCancel.addEventListener('click', closeDeleteModal);
    el.btnDeleteConfirm.addEventListener('click', executeDeleteTask);

    // Tutup modal jika klik backdrop
    [el.taskModal, el.detailModal, el.deleteModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });

    // ESC key untuk menutup modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeTaskModal();
        closeTaskDetailModal();
        closeDeleteModal();
      }
    });

    // Window Resize
    window.addEventListener('resize', () => {
      renderDependencyLines(getFilteredTasks(), state.lastCoords || {});
    });
  }

  // --- Utility Escape HTML ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- Inisialisasi ---
  function init() {
    loadTasks();
    setupScrollSync();
    setupPaneDivider();
    bindEvents();
    renderAll();

    // Scroll awal ke minggu dan tanggal hari ini
    setTimeout(() => {
      scrollToToday();
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
