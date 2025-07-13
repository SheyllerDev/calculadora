document.addEventListener('DOMContentLoaded', () => {
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    // Arrays de datos proporcionados
    const asignacionesCicloFecha = {
        1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4,
        9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3,
        16: 5, 17: 5, 18: 5, 19: 5, 20: 5, 21: 5, 22: 5,
        23: 1, 24: 1, 25: 1, 26: 1, 27: 1, 28: 1, 29: 1, 30: 1, 31: 1
    };

    const ciclosFacturacion = {
        1: { templateInicio: "1 de {mesActual}", templateFin: "30 de {mesActual}" },
        3: { templateInicio: "16 de {mesActual}", templateFin: "15 de {mesSiguiente}" },
        5: { templateInicio: "23 de {mesActual}", templateFin: "22 de {mesSiguiente}" },
        4: { templateInicio: "9 de {mesActual}", templateFin: "8 de {mesSiguiente}" }
    };

    // Referencias a los elementos del DOM
    const planTarifarioSelect = document.getElementById('planTarifario'); // Añadido
    const mesSeleccionado = document.getElementById('mesSeleccionado');
    const diasDelMesElement = document.getElementById('diasDelMes');
    const fechaActivacionInput = document.getElementById('fechaActivacion');
    const fechaActivacionError = document.getElementById('fechaActivacionError');
    const lineasActivasSelect = document.getElementById('lineasActivas');
    const tituloCicloFactElement = document.getElementById('tituloCicloFact');
    const cicloResultadoElement = document.getElementById('cicloResultado');
    const cicloFactSelect = document.getElementById('cicloFact'); 
    const fechaInicioElement = document.getElementById('fechaInicio');
    const fechaFinElement = document.getElementById('fechaFin');

    // --- Lógica del 2do desplegable (Meses y Días) ---

    // Generar opciones de meses (incluyendo "Seleccione un mes")
    function populateMeses() {
        // Añadir la opción "Seleccione un mes" primero
        const defaultOption = document.createElement('option');
        defaultOption.value = ""; // Valor vacío
        defaultOption.textContent = "Seleccione un mes";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.hidden = true;
        mesSeleccionado.appendChild(defaultOption);

        meses.forEach((mes, index) => {
            const option = document.createElement('option');
            option.value = index + 1; // 1-12
            option.textContent = mes;
            mesSeleccionado.appendChild(option);
        });
    }
    populateMeses(); // Llama a la función al cargar

    // Función para obtener los días del mes
    function getDaysInMonth(monthIndex, year) {
        return new Date(year, monthIndex, 0).getDate();
    }

    // Mostrar días del mes seleccionado
    function updateDiasDelMes() {
        const selectedMonth = parseInt(mesSeleccionado.value);
        if (isNaN(selectedMonth) || mesSeleccionado.value === "") { // Si no se ha seleccionado un mes válido
            diasDelMesElement.textContent = "Por favor, seleccione un mes.";
        } else {
            const currentYear = new Date().getFullYear();
            const dias = getDaysInMonth(selectedMonth, currentYear);
            diasDelMesElement.textContent = `El mes de ${meses[selectedMonth - 1]} tiene ${dias} días.`;
        }
    }

    mesSeleccionado.addEventListener('change', () => {
        updateDiasDelMes();
        updateFacturacionInfo(); 
    });
    // Llamar una vez al inicio para que el mensaje "Seleccione un mes" aparezca
    updateDiasDelMes(); 

    // --- Lógica del Textbox (Fecha de activación) ---

    fechaActivacionInput.addEventListener('input', (event) => {
        const value = parseInt(event.target.value);
        fechaActivacionError.textContent = '';
        
        if (event.target.value === "") { // Si el campo está vacío
            fechaActivacionError.textContent = ""; // No mostrar error, solo se espera input
        } else if (isNaN(value) || value < 1 || value > 31) {
            fechaActivacionError.textContent = "Dato inválido: Ingrese un número entre 1 y 31.";
            if (value !== '') { 
                alert("Dato inválido: Ingrese un número entre 1 y 31.");
            }
        } else {
            if (String(value).length > 2) {
                event.target.value = String(value).substring(0, 2);
            }
        }
        updateFacturacionInfo();
        if (lineasActivasSelect.value === 'NO') {
            updateCicloInfo(); 
        }
    });

    // --- Lógica de los desplegables de Ciclo y Líneas Activas ---

    // Función para habilitar/deshabilitar el desplegable de ciclo
    function toggleCicloFact() {
        const clienteActivo = lineasActivasSelect.value === 'SI';
        cicloFactSelect.disabled = !clienteActivo; 
        
        // Si se deshabilita, resetear a "Seleccione un ciclo"
        if (!clienteActivo) {
            cicloFactSelect.value = ""; 
        }
    }

    // Función para actualizar la información de ciclo de facturación
    function updateCicloInfo() {
        const clienteActivo = lineasActivasSelect.value === 'SI';
        let resultadoCiclo;

        if (clienteActivo) {
            tituloCicloFactElement.textContent = "CICLO DE FACTURACIÓN ANTERIOR";
            const cicloSeleccionado = cicloFactSelect.value;

            if (cicloSeleccionado === "") { // Si no se ha seleccionado un ciclo
                resultadoCiclo = 'Seleccione un ciclo';
            } else {
                resultadoCiclo = asignacionesCicloFecha[cicloSeleccionado] || 'No encontrado';
            }
            cicloResultadoElement.textContent = resultadoCiclo; 
            
        } else {
            tituloCicloFactElement.textContent = "CICLO DE FACTURACIÓN A ASIGNAR";
            const fechaActivacion = parseInt(fechaActivacionInput.value);
            if (isNaN(fechaActivacion) || fechaActivacion < 1 || fechaActivacion > 31) {
                resultadoCiclo = 'Ingrese fecha de activación'; 
            } else {
                resultadoCiclo = asignacionesCicloFecha[fechaActivacion] || 'No encontrado';
            }
            cicloResultadoElement.textContent = resultadoCiclo; 
        }
    }

    // Actualizar info de inicio/fin de facturación
    function updateFacturacionInfo() {
        const clienteActivo = lineasActivasSelect.value === 'SI';
        let cicloDeterminante;
        const fechaActivacion = parseInt(fechaActivacionInput.value);
        const selectedMonth = parseInt(mesSeleccionado.value);

        // Validaciones iniciales para mostrar mensajes de solicitud
        if (planTarifarioSelect.value === "") { // Añadido
             fechaInicioElement.textContent = 'Seleccione un plan';
             fechaFinElement.textContent = 'Seleccione un plan';
             return;
        }

        if (isNaN(selectedMonth) || mesSeleccionado.value === "") {
            fechaInicioElement.textContent = 'Seleccione un mes';
            fechaFinElement.textContent = 'Seleccione un mes';
            return;
        }
        
        if (!clienteActivo) { // Si NO tiene líneas activas, depende de la fecha de activación
            if (isNaN(fechaActivacion) || fechaActivacion < 1 || fechaActivacion > 31) {
                fechaInicioElement.textContent = 'Ingrese fecha de activación'; 
                fechaFinElement.textContent = 'Ingrese fecha de activación';   
                return;
            }
            cicloDeterminante = asignacionesCicloFecha[fechaActivacion];
        } else { // Si SÍ tiene líneas activas, depende del ciclo seleccionado
            const cicloSeleccionadoPorCliente = cicloFactSelect.value;
            if (cicloSeleccionadoPorCliente === "") {
                fechaInicioElement.textContent = 'Seleccione un ciclo';
                fechaFinElement.textContent = 'Seleccione un ciclo';
                return;
            }
            cicloDeterminante = asignacionesCicloFecha[cicloSeleccionadoPorCliente];
        }

        const fechasTemplate = ciclosFacturacion[cicloDeterminante];

        if (fechasTemplate) {
            const currentMonthName = meses[selectedMonth - 1]; 
            
            let nextMonthIndex = selectedMonth + 1; // Ya es 1-12
            let nextMonthName;
            if (nextMonthIndex > 12) {
                nextMonthIndex = 1; 
                nextMonthName = meses[0]; // Enero del siguiente año
            } else {
                nextMonthName = meses[nextMonthIndex - 1];
            }

            const inicioReal = fechasTemplate.templateInicio
                .replace('{mesActual}', currentMonthName)
                .replace('{mesSiguiente}', nextMonthName);
            
            const finReal = fechasTemplate.templateFin
                .replace('{mesActual}', currentMonthName)
                .replace('{mesSiguiente}', nextMonthName);

            fechaInicioElement.textContent = inicioReal;
            fechaFinElement.textContent = finReal;
        } else {
            // Este caso se daría si cicloDeterminante no encuentra un match o es undefined, 
            // lo cual debería ser manejado por las validaciones de arriba
            fechaInicioElement.textContent = 'N/A';
            fechaFinElement.textContent = 'N/A';
        }
    }

    // Event listeners para los desplegables
    planTarifarioSelect.addEventListener('change', updateFacturacionInfo); // Añadido
    lineasActivasSelect.addEventListener('change', () => {
        toggleCicloFact(); 
        updateCicloInfo(); 
        updateFacturacionInfo(); 
    });
    
    cicloFactSelect.addEventListener('change', () => {
        updateCicloInfo();
        updateFacturacionInfo();
    });

    // Inicializar la información al cargar la página
    toggleCicloFact(); 
    updateCicloInfo();
    updateFacturacionInfo();
});
