function normalizeAndExport() {
    const inputText = document.getElementById('domainsInput').value;
    const lines = inputText.split('\n');
    const normalizedLines = lines.map(line => normalizeDomain(line)).filter(Boolean); // Удаляем пустые строки
    const uniqueDomains = [...new Set(normalizedLines)];

    const splitByCheckbox = document.getElementById('splitBy');
    const splitSize = splitByCheckbox.checked ? 200 : Infinity;

    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; // Очищаем контейнер результатов

    for (let i = 0; i < uniqueDomains.length; i += splitSize) {
        const block = document.createElement('div');
        block.className = 'resultBlock';
        block.innerHTML = `
            <textarea>${uniqueDomains.slice(i, i + splitSize).map(d => `<div>${d}</div>`).join('')}</textarea>
            <button class="copyButton">Скопировать</button>
            <button class="downloadButton">Скачать</button>
        `;
        resultsContainer.appendChild(block);

        // Добавляем обработчики событий для кнопок
        block.querySelector('.copyButton').addEventListener('click', () => {
            navigator.clipboard.writeText(block.querySelector('div').textContent);
        });

        block.querySelector('.downloadButton').addEventListener('click', () => {
            const csvContent = block.querySelector('div').textContent;
            const blob = new Blob([csvContent], {type: "text/plain;charset=utf-8"}); // Изменили тип на plain/text для текстового файла
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "unique_domains.txt"); // Изменили расширение на .txt для текстового файла
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
}
