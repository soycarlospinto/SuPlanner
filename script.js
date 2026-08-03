document.addEventListener("DOMContentLoaded", () => {

    // Sistema de Notificaciones Toast animadas
    function showToast(message) {
        const container = document.getElementById("toastContainer");
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
        
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // 1. Botón de Regresar
    document.getElementById("btnBack").addEventListener("click", () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            showToast("Estás en la página principal.");
        }
    });

    // 2. Renderizado del Calendario con selección y tooltips dinámicos
    function renderCalendar() {
        const calendarGrid = document.getElementById("calendarGrid");
        calendarGrid.innerHTML = "";

        for (let i = 1; i <= 21; i++) {
            const dayDiv = document.createElement("div");
            dayDiv.className = i === 7 ? "day today" : "day";
            dayDiv.textContent = i;
            dayDiv.setAttribute("data-day", i);

            const dayStr = String(i).padStart(2, '0');
            let matches = [];

            document.querySelectorAll(".note").forEach(note => {
                const noteDate = note.getAttribute("data-date");
                if (noteDate && noteDate.startsWith(dayStr)) {
                    matches.push("Nota: " + note.querySelector("h3").textContent);
                }
            });

            document.querySelectorAll(".event").forEach(event => {
                const eventSpan = event.querySelector("span").textContent.toLowerCase();
                if (eventSpan.includes(i)) {
                    matches.push("Evento: " + event.childNodes[0].textContent.trim());
                }
            });

            const tooltip = document.createElement("div");
            tooltip.className = "calendar-tooltip";
            if (matches.length > 0) {
                tooltip.innerHTML = `<strong>Día ${i}</strong><br>` + matches.join("<br>");
            } else {
                tooltip.innerHTML = `Día ${i}<br>Sin notas ni eventos`;
            }

            dayDiv.appendChild(tooltip);

            // Selección de día con animación de toque
            dayDiv.addEventListener("click", () => {
                document.querySelectorAll(".day").forEach(d => d.classList.remove("selected-day"));
                dayDiv.classList.add("selected-day");
                showToast(`Día ${i} seleccionado`);
            });

            calendarGrid.appendChild(dayDiv);
        }
    }

    // 3. Visualizar Nota al hacer clic
    const viewNoteModal = document.getElementById("viewNoteModal");
    const viewNoteTitle = document.getElementById("viewNoteTitle");
    const viewNoteDate = document.getElementById("viewNoteDate");
    const viewNoteContent = document.getElementById("viewNoteContent");
    const closeViewModalBtn = document.getElementById("closeViewModalBtn");

    function attachNoteClickEvent(noteElement) {
        noteElement.addEventListener("click", (e) => {
            if (e.target.closest(".delete-note")) return;

            const title = noteElement.querySelector("h3").textContent;
            const date = noteElement.querySelector("small").textContent;
            const content = noteElement.getAttribute("data-content") || "Sin contenido detallado.";

            viewNoteTitle.textContent = title;
            viewNoteDate.textContent = "Fecha: " + date;
            viewNoteContent.textContent = content;
            viewNoteModal.classList.add("active");
        });
    }

    closeViewModalBtn.addEventListener("click", () => {
        viewNoteModal.classList.remove("active");
    });

    // 4. Gestión del Modal para Crear Notas
    const addNoteBtn = document.getElementById("addNoteBtn");
    const noteModal = document.getElementById("noteModal");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const saveNoteBtn = document.getElementById("saveNoteBtn");
    const noteTitleInput = document.getElementById("noteTitleInput");
    const noteContentInput = document.getElementById("noteContentInput");
    const noteDateInput = document.getElementById("noteDateInput");
    const noteColorInput = document.getElementById("noteColorInput");
    const notesContainer = document.getElementById("notesContainer");
    const totalNotesElem = document.getElementById("totalNotes");

    function updateNotesCount() {
        const currentCount = document.querySelectorAll(".note").length;
        totalNotesElem.textContent = currentCount;
        renderCalendar();
    }

    // Delegación o eventos directos para borrar notas
    document.querySelectorAll(".delete-note").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const noteCard = btn.closest(".note");
            noteCard.style.transform = "scale(0.8)";
            noteCard.style.opacity = "0";
            setTimeout(() => {
                noteCard.remove();
                updateNotesCount();
                showToast("Nota eliminada con éxito");
            }, 300);
        });
    });

    document.querySelectorAll(".note").forEach(note => {
        attachNoteClickEvent(note);
    });

    addNoteBtn.addEventListener("click", () => {
        noteTitleInput.value = "";
        noteContentInput.value = "";
        noteDateInput.value = new Date().toISOString().split('T')[0];
        noteModal.classList.add("active");
    });

    cancelModalBtn.addEventListener("click", () => {
        noteModal.classList.remove("active");
    });

    saveNoteBtn.addEventListener("click", () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim() || "Sin contenido detallado.";
        const dateVal = noteDateInput.value;
        const color = noteColorInput.value;

        if (!title) {
            showToast("Por favor, introduce un título.");
            return;
        }

        let formattedDate = "Sin fecha";
        if (dateVal) {
            const parts = dateVal.split("-");
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        const newNote = document.createElement("div");
        newNote.className = `note ${color}`;
        newNote.setAttribute("data-date", formattedDate);
        newNote.setAttribute("data-content", content);
        newNote.innerHTML = `
            <button class="delete-note" title="Eliminar nota"><i class="fa-solid fa-trash"></i></button>
            <small>${formattedDate}</small>
            <h3>${title}</h3>
            <i class="fa-solid fa-note-sticky"></i>
        `;

        newNote.querySelector(".delete-note").addEventListener("click", (e) => {
            e.stopPropagation();
            newNote.style.transform = "scale(0.8)";
            newNote.style.opacity = "0";
            setTimeout(() => {
                newNote.remove();
                updateNotesCount();
                showToast("Nota eliminada con éxito");
            }, 300);
        });

        attachNoteClickEvent(newNote);
        notesContainer.appendChild(newNote);
        updateNotesCount();
        noteModal.classList.remove("active");
        showToast("¡Nota creada con éxito!");
    });

    // 5. Tareas Rápidas
    const quickTaskInput = document.getElementById("quickTaskInput");
    const addQuickTaskBtn = document.getElementById("addQuickTaskBtn");
    const quickTasksList = document.getElementById("quickTasksList");

    function addQuickTask() {
        const text = quickTaskInput.value.trim();
        if (!text) return;

        const taskItem = document.createElement("div");
        taskItem.className = "quick-task-item";
        taskItem.innerHTML = `
            <span>${text}</span>
            <button class="delete-quick-task"><i class="fa-solid fa-xmark"></i></button>
        `;

        taskItem.addEventListener("click", (e) => {
            if (!e.target.closest("button")) {
                taskItem.classList.toggle("completed");
            }
        });

        taskItem.querySelector(".delete-quick-task").addEventListener("click", () => {
            taskItem.remove();
            showToast("Tarea rápida eliminada");
        });

        quickTasksList.appendChild(taskItem);
        quickTaskInput.value = "";
        showToast("Tarea rápida añadida");
    }

    addQuickTaskBtn.addEventListener("click", addQuickTask);
    quickTaskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addQuickTask();
    });

    document.querySelectorAll(".quick-task-item").forEach(item => {
        item.addEventListener("click", (e) => {
            if (!e.target.closest("button")) {
                item.classList.toggle("completed");
            }
        });
        item.querySelector(".delete-quick-task").addEventListener("click", () => {
            item.remove();
        });
    });

    // 6. Hábitos Diarios
    document.querySelectorAll(".habit-item").forEach(item => {
        item.addEventListener("click", () => {
            item.classList.toggle("completed");
            if(item.classList.contains("completed")) {
                showToast("¡Hábito completado con éxito! 🎉");
            }
        });
    });

    // 7. Modo Oscuro con Animación y Almacenamiento Visual
    const btnTheme = document.getElementById("btnTheme");
    const body = document.getElementById("body");
    const themeIcon = document.getElementById("themeIcon");

    btnTheme.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        if (body.classList.contains("dark-mode")) {
            themeIcon.classList.replace("fa-moon", "fa-sun");
            showToast("Modo oscuro activado 🌙");
        } else {
            themeIcon.classList.replace("fa-sun", "fa-moon");
            showToast("Modo claro activado ☀️");
        }
    });

    // 8. Buscador en tiempo real de notas
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll(".note").forEach(note => {
            const title = note.querySelector("h3").textContent.toLowerCase();
            note.style.display = title.includes(term) ? "flex" : "none";
        });
    });

    // Inicializar Calendario
    renderCalendar();
});