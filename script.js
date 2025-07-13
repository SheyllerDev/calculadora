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

    // Generar opciones de meses
    meses.forEach((mes, index) => {
        const option = document.createElement('option');
        option.value = index + 1; // 1-12
        option.textContent = mes;
        mesSeleccionado.appendChild(option);
    });

    // Función para obtener los días del mes
    function getDaysInMonth(monthIndex, year) {
        return new Date(year, monthIndex, 0).getDate();
    }

    // Mostrar días del mes seleccionado (por defecto el mes actual)
    function updateDiasDelMes() {
        const selectedMonth = parseInt(mesSeleccionado.value);
        const currentYear = new Date().getFullYear();
        const dias = getDaysInMonth(selectedMonth, currentYear);
        diasDelMesElement.textContent = `El mes de ${meses[selectedMonth - 1]} tiene ${dias} días.`;
    }

    mesSeleccionado.addEventListener('change', () => {
        updateDiasDelMes();
        updateFacturacionInfo(); 
    });
    updateDiasDelMes(); 

    // --- Lógica del Textbox (Fecha de activación) ---

    fechaActivacionInput.addEventListener('input', (event) => {
        const value = parseInt(event.target.value);
        fechaActivacionError.textContent = '';
        
        if (isNaN(value) || value < 1 || value > 31) {
            fechaActivacionError.textContent = "Dato inválido: Ingrese un número entre 1 y 31.";
            event.target.value = ''; 
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
    }

    // Función para actualizar la información de ciclo de facturación
    function updateCicloInfo() {
        const clienteActivo = lineasActivasSelect.value === 'SI';
        const cicloSeleccionado = cicloFactSelect.value;
        let resultadoCiclo;

        if (clienteActivo) {
            tituloCicloFactElement.textContent = "CICLO DE FACTURACIÓN ANTERIOR";
            
            const cicloAnterior = asignacionesCicloFecha[cicloSeleccionado];
            resultadoCiclo = cicloAnterior ? cicloAnterior : 'No encontrado';
            cicloResultadoElement.textContent = resultadoCiclo; 
            
        } else {
            tituloCicloFactElement.textContent = "CICLO DE FACTURACIÓN A ASIGNAR";
            const fechaActivacion = parseInt(fechaActivacionInput.value);
            if (fechaActivacion >= 1 && fechaActivacion <= 31) {
                resultadoCiclo = asignacionesCicloFecha[fechaActivacion];
            } else {
                resultadoCiclo = 'Ingrese fecha de activación'; 
            }
            cicloResultadoElement.textContent = resultadoCiclo; 
        }
    }

    // Actualizar info de inicio/fin de facturación
    function updateFacturacionInfo() {
        const clienteActivo = lineasActivasSelect.value === 'SI';
        let cicloDeterminante;
        let fechaActivacion = parseInt(fechaActivacionInput.value);

        if ( (isNaN(fechaActivacion) || fechaActivacion < 1 || fechaActivacion > 31) && !clienteActivo ) {
            fechaInicioElement.textContent = 'Ingrese fecha de activación'; 
            fechaFinElement.textContent = 'Ingrese fecha de activación';   
            return;
        }

        if (!clienteActivo) {
            cicloDeterminante = asignacionesCicloFecha[fechaActivacion];
        } else {
            cicloDeterminante = asignacionesCicloFecha[cicloFactSelect.value];
        }

        const fechasTemplate = ciclosFacturacion[cicloDeterminante];

        if (fechasTemplate) {
            const selectedMonthIndex = parseInt(mesSeleccionado.value); // 1-12
            const currentMonthName = meses[selectedMonthIndex - 1]; 
            
            let nextMonthIndex = selectedMonthIndex + 1;
            if (nextMonthIndex > 12) {
                nextMonthIndex = 1; 
            }
            const nextMonthName = meses[nextMonthIndex - 1];

            const inicioReal = fechasTemplate.templateInicio
                .replace('{mesActual}', currentMonthName)
                .replace('{mesSiguiente}', nextMonthName);
            
            const finReal = fechasTemplate.templateFin
                .replace('{mesActual}', currentMonthName)
                .replace('{mesSiguiente}', nextMonthName);

            fechaInicioElement.textContent = inicioReal;
            fechaFinElement.textContent = finReal;
        } else {
            fechaInicioElement.textContent = 'N/A';
            fechaFinElement.textContent = 'N/A';
        }
    }

    // Event listeners para los desplegables
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