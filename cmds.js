const model = require('./model');
const{log, biglog, errorlog, colorize} = require("./out");


/**
  * Muestra la ayuda
  *
  * @param rl Objeto readline usado para implementar el CLI.
  */

  exports.helpCmd = rl => {
    log(" Commandos:");
    log(" h|help - Muestra esta ayuda.");
    log(" list -Listar los quizzes existentes.");
    log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log(" add - Añadir un nuevo quiz interactivamente.");
    log( "delete <id> - Borrar el quiz indicado.");
    log( "edit <id> -Editar el quiz indicado.");
    log( "test <id> -Probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Créditos.");
    log(" q|quit _ Salir del programa.");
    rl.prompt();
  };

/**
  * Terminar el programa
  */
  exports.quitCmd = rl => {
    rl.close();
    //rl.prompt();
  };

/**
  * Añade un nuevo quiz al módelo
  * Pregunta interactivamente por la pregunta y por la resuesta
  * @param rl  Objeto readline usado para implementar el CLI
  */
  exports.addCmd = rl => {
  	 rl.question(colorize('Introduzca una pregunta: ', 'red'), question => {
   		rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
   			model.add(question, answer);
   			log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
   			rl.prompt();
   		});
   	 });
  };

/**
  * Lista todos los quizzes existentes en el modelo
  */

  exports.listCmd = rl => {

  	model.getAll().forEach((quiz, id) => {
  		log(`  [${colorize(id, 'magenta')}]: ${quiz.question}`);
  	});

    
    rl.prompt();
  };

/**
  * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
  *
  * @param id Clave del quiz a mostrar.
  */

  exports.showCmd = (rl,id) => {
    
  	if( typeof id === "undefined"){
  		errorlog(`Falta el parámetro id.`);
	} else {
		try {
			const quiz = model.getByIndex(id);
			log(` [${colorize(id, 'magenta')}]:   ${quiz.question}  ${colorize('=>','magenta')} ${quiz.answer}`);
		} catch(error) {
			errorlog(error.message);
		}
	}

    rl.prompt();
  };

/**
  * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
  *
  * @param id Clave del quiz a probar.
  * @param rl Objeto readline usado para implementar el CLI
  */

  exports.testCmd = (rl,id) => {
    
   if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);
            rl.question(`${colorize(quiz.question, 'red')}${colorize('?', 'red')} `, (answer) => {
                if (answer.trim().toLowerCase() === quiz.answer.toLowerCase()) {
                    biglog('Correcto', 'green');
                } else {
                    biglog('Incorrecto', 'red');
                }
                rl.prompt();
            });
        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
  };

/**
  * Pregunta todos los quizzes existentes en el modelo en orden aleatorio
  * Se gana si se contesta a todos satisfactoriamente.
  */
  exports.playCmd = rl => {
    	let score = 0;
    	let toBeResolved = [];
    	let quizzes = model.getAll();
    	for (let i = 0; i < quizzes.length; i++) {
      		  toBeResolved.push(i);
   		 }

    	const playOne = () => {
       		 if (toBeResolved.length === 0) {
         		   log('No hay nada más que preguntar');
          		   fin();
           		   rl.prompt();
       		 } else {
            		let id = Math.floor((Math.random() * toBeResolved.length));
           			let quiz = quizzes[id];
            		rl.question(`${colorize(quiz.question, 'red')}${colorize('?', 'red')} `, (answer) => {
                	if (answer.trim().toLowerCase() === quiz.answer.toLowerCase()) {
                    	score++;
                    	log(`CORRECTO - Lleva ${score} acierto/s.`);
                    	toBeResolved.splice(id, 1);
                    	quizzes.splice(id, 1);
                    	playOne();
                } else {
                   		log (`INCORRECTO.`);
                    	fin();
                    	rl.prompt();
                }
            });
        }
    };

    const fin = () => {
        log(`Fin del examen. Aciertos:`);
        biglog(score, 'magenta');
    }

    playOne();
  };

/**
  * Borra un quiz del modelo.
  *
  * @param id clave del quiz a borrar en el modelo
  * @param rl Objeto readline usado para implementar el CLI
  */

  exports.deleteCmd = (rl, id) => {
    
  	if( typeof id === "undefined"){
  		errorlog(`Falta el parámetro id.`);
	} else {
		try {
			model.deleteByIndex(id);
			//log(` [${colorize(id, 'magenta')}]:   ${quiz.question}  ${colorize('=>','magenta')} ${quiz.answer}`);
		} catch(error) {
			errorlog(error.message);
		}
	}

    rl.prompt();
  };

/**
  * Edita un quiz del modelo.
  *
  * @param id Clave del quiz a editar en el modelo.
  * @param rl Objeto readline usado para implementar el CLI
  */

  exports.editCmd = (rl,id) => {
  	if( typeof id === "undefined"){
  		errorlog(`Falta el parámetro id.`);
  		rl.prompt();
	} else {
		try {
			const quiz = model.getByIndex(id);
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
			rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
				rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
					model.update(id, question, answer);
					log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
					rl.prompt();
				});
			});
    	} catch (error) {
    		errorlog(error.message);
    		rl.prompt();
    	}
    }   
  };

/**
  * Muestra los nombres de los autores de la práctica.
  */
 exports.creditsCmd = function(rl) {
    log('Autores de la práctica');
    log('Eros García Arroyo', 'green');
    log('Luis García Olivares', 'green');
    rl.prompt();
};