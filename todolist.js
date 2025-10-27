document.addEventListener('DOMContentLoaded', () => {
  const taskList = document.getElementById('task-list');
  const searchInput = document.getElementById('search');
  const newTaskInput = document.getElementById('new-task');
  const taskDateInput = document.getElementById('task-date');
  const addTaskBtn = document.getElementById('add-task-btn');
  let isEditing = false; // Флаг для отслеживания редактирования

  /* === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ === */

  // Показ современного окна ошибки
  function showError(message) {
    if (document.querySelector('.error-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'error-overlay';

    const popup = document.createElement('div');
    popup.className = 'error-popup';
    popup.innerHTML = `
      <p>${message}</p>
      <button id="close-error">OK</button>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    document.getElementById('close-error').addEventListener('click', () => {
      overlay.remove();
    });
  }

  // Загрузка задач
  const loadTasks = () => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    taskList.innerHTML = '';
    tasks.forEach(task => createTaskElement(task.text, task.date, task.completed));
  };

  // Сохранение задачи
  const saveTask = (text, date) => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ text, date, completed: false });
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  // Обновление localStorage
  const updateLocalStorage = () => {
    const tasks = [];
    const items = taskList.getElementsByTagName('li');
    for (let item of items) {
      const checkbox = item.querySelector('.task-checkbox');
      const spans = item.getElementsByTagName('span');
      const text = spans[0].textContent;
      const date = spans[1].textContent.trim();
      const completed = checkbox.checked;
      tasks.push({ text, date: date.includes('No Date') ? '' : date, completed });
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  /* === СОЗДАНИЕ ЭЛЕМЕНТА ЗАДАЧИ === */
  const createTaskElement = (taskText, taskDate, completed = false) => {
    const li = document.createElement('li');

    // Чекбокс
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('task-checkbox');
    checkbox.checked = completed;
    li.appendChild(checkbox);

    // Текст задачи
    const textSpan = document.createElement('span');
    textSpan.textContent = taskText;
    li.appendChild(textSpan);

    // Дата задачи
    const dateSpan = document.createElement('span');
    dateSpan.textContent = taskDate ? ` ${taskDate}` : ' (No Date)';
    dateSpan.style.marginLeft = '10px';
    li.appendChild(dateSpan);

    // Применяем стиль, если выполнена
    if (completed) {
      textSpan.style.textDecoration = 'line-through';
      textSpan.style.opacity = '0.5';
      dateSpan.style.textDecoration = 'line-through';
      dateSpan.style.opacity = '0.5';
    }

    // Изменение состояния задачи
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        textSpan.style.textDecoration = 'line-through';
        textSpan.style.opacity = '0.5';
        dateSpan.style.textDecoration = 'line-through';
        dateSpan.style.opacity = '0.5';
      } else {
        textSpan.style.textDecoration = 'none';
        textSpan.style.opacity = '1';
        dateSpan.style.textDecoration = 'none';
        dateSpan.style.opacity = '1';
      }
      updateLocalStorage();
    });

    // Редактирование задачи
    textSpan.addEventListener('click', () => {
      if (isEditing) {
        showError('You can edit only one task at a time.');
        return;
      }

      isEditing = true; // Устанавливаем флаг редактирования

      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.value = taskText;
      textInput.style.width = '150px';

      const dateInput = document.createElement('input');
      dateInput.type = 'date';
      dateInput.value = taskDate || '';

      li.replaceChild(textInput, textSpan);
      li.replaceChild(dateInput, dateSpan);

      const saveChanges = () => {
        const updatedText = textInput.value.trim();
        const updatedDate = dateInput.value;
        const today = new Date().toISOString().split('T')[0];

        if (updatedText.length < 3 || updatedText.length > 255) {
          showError('Task must be between 3 and 255 characters.');
          return;
        }

        if (updatedDate && updatedDate < today) {
          showError('Task date must be today or in the future.');
          return;
        }

        taskText = updatedText;
        taskDate = updatedDate;
        textSpan.textContent = taskText;
        dateSpan.textContent = taskDate ? ` ${taskDate}` : ' (No Date)';

        li.replaceChild(textSpan, textInput);
        li.replaceChild(dateSpan, dateInput);
        updateLocalStorage();
        isEditing = false; // Сбрасываем флаг редактирования
      };

      textInput.addEventListener('blur', saveChanges);
      dateInput.addEventListener('blur', saveChanges);
      textInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') saveChanges();
      });
      dateInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') saveChanges();
      });
    });

    // Кнопка удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => {
      li.remove();
      updateLocalStorage();
    });
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  };

  /* === ДОБАВЛЕНИЕ НОВОЙ ЗАДАЧИ === */
  addTaskBtn.addEventListener('click', () => {
    const taskText = newTaskInput.value.trim();
    const taskDate = taskDateInput.value;
    const today = new Date().toISOString().split('T')[0];

    if (taskText.length < 3 || taskText.length > 255) {
      showError('Task must be between 3 and 255 characters.');
      return;
    }

    if (taskDate && taskDate < today) {
      showError('Task date must be today or in the future.');
      return;
    }

    createTaskElement(taskText, taskDate);
    saveTask(taskText, taskDate);

    newTaskInput.value = '';
    taskDateInput.value = '';
  });

  /* === ПОИСК === */
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    const items = taskList.getElementsByTagName('li');

    for (let item of items) {
      const textSpan = item.querySelector('span');
      const originalText = textSpan.textContent;
      const lowerText = originalText.toLowerCase();

      textSpan.innerHTML = originalText;

      if (query === '') {
        item.style.display = '';
      } else if (query.length >= 2 && lowerText.includes(query)) {
        const regex = new RegExp(`(${query})`, 'gi');
        const highlightedText = originalText.replace(regex, '<span class="highlight">$1</span>');
        textSpan.innerHTML = highlightedText;
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    }
  });

  // Загрузка задач при старте
  loadTasks();
});