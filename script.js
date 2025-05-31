function normalizeDomain(domain) {
    return domain
        .trim()
        .toLowerCase()
        .replace(/^(https?:\/\/)?(www\.)?/, '') // Удаляем протокол и www
        .replace(/\/$/, '') // Удаляем trailing slash
        .replace(/^\*\./, ''); // Удаляем wildcard в начале
}


function createButton(text, className, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

/**
 * Скачивает текст как файл
 * @param {string} content - Содержимое файла
 * @param {string} filename - Имя файла
 */
function downloadAsFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

function normalizeAndExport() {
    try {
        // Получаем элементы DOM
        const inputText = document.getElementById('domainsInput').value;
        const countDevine = parseInt(document.getElementById('count-devine').value) || 200;
        const splitByCheckbox = document.getElementById('splitBy').checked;
        const resultsContainer = document.getElementById('resultsContainer');
        
        // Проверка на пустой ввод
        if (!inputText.trim()) {
            resultsContainer.innerHTML = '<p class="error">Пожалуйста, введите список доменов</p>';
            return;
        }
        
        // Нормализация и дедупликация доменов
        const uniqueDomains = [...new Set(
            inputText.split('\n')
                .map(line => normalizeDomain(line))
                .filter(domain => domain) // Удаляем пустые строки
                .sort() // Сортируем алфавитно
        )];
        
        const totalDomains = uniqueDomains.length;
        const splitSize = splitByCheckbox ? Math.max(1, countDevine) : totalDomains;
        resultsContainer.innerHTML = '';
        
        // Создаем фрагмент для эффективного добавления в DOM
        const fragment = document.createDocumentFragment();
        
        // Добавляем общую статистику
        const stats = document.createElement('div');
        stats.className = 'stats';
        stats.innerHTML = `Найдено уникальных доменов: <strong>${totalDomains}</strong> | ` +
                         `Разделено на: <strong>${Math.ceil(totalDomains / splitSize)}</strong> частей`;
        fragment.appendChild(stats);
        
        // Обрабатываем чанки доменов
        for (let i = 0; i < totalDomains; i += splitSize) {
            const chunk = uniqueDomains.slice(i, i + splitSize);
            const chunkText = chunk.join('\n');
            
            // Создаем блок для чанка
            const block = document.createElement('div');
            block.className = 'result-block';
            
            // Добавляем заголовок с диапазоном
            const header = document.createElement('div');
            header.className = 'block-header';
            
            if (splitByCheckbox) {
                const endRange = Math.min(i + splitSize, totalDomains);
                header.textContent = `Домены ${i + 1}-${endRange}`;
            } else {
                header.textContent = 'Все домены';
            }
            
            block.appendChild(header);
            
            // Добавляем textarea с доменами
            const textarea = document.createElement('textarea');
            textarea.readOnly = true;
            textarea.value = chunkText;
            block.appendChild(textarea);
            
            // Добавляем кнопки действий
            const buttons = document.createElement('div');
            buttons.className = 'block-actions';
            
            buttons.appendChild(
                createButton('Копировать', 'copy-btn', (e) => {
                    const button = e.currentTarget;
                    navigator.clipboard.writeText(chunkText)
                    .then(() => {
                        button.classList.add('copied');
                        setTimeout(() => {
                        button.classList.remove('copied');
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Ошибка копирования: ', err);
                        button.textContent = 'Ошибка!';
                        setTimeout(() => {
                        button.textContent = 'Копировать';
                        }, 2000);
                    });
                })
            );
            
            buttons.appendChild(
                createButton('Скачать', 'download-btn', () => {
                    const part = splitByCheckbox ? `_part_${(i / splitSize) + 1}` : '';
                    downloadAsFile(chunkText, `domains${part}.txt`);
                })
            );
            
            block.appendChild(buttons);
            fragment.appendChild(block);
        }
        
        resultsContainer.appendChild(fragment);
        
    } catch (error) {
        console.error('Произошла ошибка:', error);
        document.getElementById('resultsContainer').innerHTML = 
            `<p class="error">Произошла ошибка: ${error.message}</p>`;
    }
}

// Инициализация событий после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Основная кнопка конвертации
    document.getElementById('convertBtn').addEventListener('click', normalizeAndExport);
    
    // Кнопка очистки
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('domainsInput').value = '';
        document.getElementById('resultsContainer').innerHTML = '';
    });
    
    // Обработка нажатия Enter в поле количества доменов
    document.getElementById('count-devine').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            normalizeAndExport();
        }
    });
});