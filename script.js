// Главная функция запуска
async function initializeApp() {
    // 1. Пытаемся инициализировать VK Bridge
    try {
        await bridge.send('VKWebAppInit');
        console.log('VK Bridge initialized');
        
        // Настройки интерфейса VK
        await bridge.send('VKWebAppSetViewSettings', {
            status_bar_style: 'dark',
            action_bar_color: '#5181b8'
        });
    } catch (e) {
        console.log('Running in standalone mode', e);
    }

    // 2. Запускаем основное приложение
    setupApp();
}

// Основная логика приложения
function setupApp() {
    // Элементы интерфейса
    const appContainer = document.getElementById('app');
    const productInput = document.getElementById('productInput');
    const addButton = document.getElementById('addButton');
    const productList = document.getElementById('productList');
    const completedCount = document.getElementById('completedCount');

    // Состояние приложения
    let items = JSON.parse(localStorage.getItem('shoppingList')) || [];
    let completedItems = parseInt(localStorage.getItem('completedItems')) || 0;

    // Показываем интерфейс (убираем loader)
    appContainer.style.display = 'block';

    // Функция рендеринга
    function renderItems() {
        if (items.length === 0) {
            productList.innerHTML = '<p class="empty-message">Список пуст</p>';
            return;
        }

        productList.innerHTML = items.map((item, index) => `
            <li class="${item.completed ? 'completed' : ''}">
                <span>${item.text}</span>
                <div class="item-actions">
                    <button class="completeButton" ${item.completed ? 'disabled' : ''}>
                        ✓
                    </button>
                    <button class="deleteButton">
                        ✕
                    </button>
                </div>
            </li>
        `).join('');

        // Вешаем обработчики
        document.querySelectorAll('.completeButton').forEach((btn, index) => {
            btn.addEventListener('click', () => completeItem(index));
        });

        document.querySelectorAll('.deleteButton').forEach((btn, index) => {
            btn.addEventListener('click', () => deleteItem(index));
        });
    }

    // Добавление нового элемента
    function addItem() {
        const text = productInput.value.trim();
        if (!text) return;

        items.push({ text, completed: false });
        productInput.value = '';
        saveState();
        renderItems();
    }

    // Отметка как выполненного
    function completeItem(index) {
        if (!items[index].completed) {
            items[index].completed = true;
            completedItems++;
            saveState();
            renderItems();
        }
    }

    // Удаление элемента
    function deleteItem(index) {
        if (items[index].completed) {
            completedItems--;
        }
        items.splice(index, 1);
        saveState();
        renderItems();
    }

    // Сохранение состояния
    function saveState() {
        localStorage.setItem('shoppingList', JSON.stringify(items));
        localStorage.setItem('completedItems', completedItems.toString());
        updateStats();
    }

    // Обновление статистики
    function updateStats() {
        completedCount.textContent = completedItems;
    }

    // Обработчики событий
    addButton.addEventListener('click', addItem);
    productInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });

    // Первоначальный рендеринг
    updateStats();
    renderItems();
}

// Запускаем приложение при полной загрузке страницы
document.addEventListener('DOMContentLoaded', initializeApp);