var Snake = (function () {

  // Constante para o tamanho inicial da cauda da cobra
  const INITIAL_TAIL = 3;
  // Flag para indicar se a cauda deve ser fixa
  var fixedTail = true;

  // ID do intervalo para o loop do jogo
  var intervalID;

  // Quantidade de blocos no tabuleiro e tamanho da grade
  var tileCount = 40;
  var gridSize;

  // Posição inicial do jogador (cobra)
  const INITIAL_PLAYER = { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) };

  // Velocidade e posição atual do jogador
  var velocity = { x: 0, y: 0 };
  var player = { x: INITIAL_PLAYER.x, y: INITIAL_PLAYER.y };

  // Flag para indicar se há paredes
  var walls = false;

  // Posição da fruta
  var fruit = { x: 1, y: 1 };

  // Array para armazenar a trilha da cobra e tamanho da cauda
  var trail = [];
  var tail = INITIAL_TAIL;

  // Variáveis para recompensas e pontos
  var reward = 0;
  var points = 0;
  var pointsMax = 0;

  // Enum para ações do jogador
  var ActionEnum = { 'none': 0, 'up': 1, 'down': 2, 'left': 3, 'right': 4 };
  Object.freeze(ActionEnum);
  var lastAction = ActionEnum.none;

  // Função de configuração inicial do jogo
  function setup() {
    canv = document.getElementById('gc');
    resizeCanvas();
    ctx = canv.getContext('2d');

    game.reset();
    window.addEventListener('resize', resizeCanvas);
  }

  // Função para redimensionar o canvas
  function resizeCanvas() {
    canv.width = canv.clientWidth;
    canv.height = canv.clientHeight;
    gridSize = Math.min(canv.width, canv.height) / tileCount;
  }

  // Função para atualizar as informações de pontos na interface
  function updateInfo() {
    document.getElementById('points').textContent = "Pontos: " + points;
    document.getElementById('max-points').textContent = "Máx: " + pointsMax;
  }

  var game = {

    // Função para resetar o jogo
    reset: function () {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canv.width, canv.height);

      tail = INITIAL_TAIL;
      points = 0;
      velocity.x = 0;
      velocity.y = 0;
      player.x = INITIAL_PLAYER.x;
      player.y = INITIAL_PLAYER.y;
      reward = -1;

      lastAction = ActionEnum.none;

      trail = [];
      trail.push({ x: player.x, y: player.y });

      updateInfo();
    },

    action: {
      up: function () {
        if (lastAction != ActionEnum.down) {
          velocity.x = 0;
          velocity.y = -1;
        }
      },
      down: function () {
        if (lastAction != ActionEnum.up) {
          velocity.x = 0;
          velocity.y = 1;
        }
      },
      left: function () {
        if (lastAction != ActionEnum.right) {
          velocity.x = -1;
          velocity.y = 0;
        }
      },
      right: function () {
        if (lastAction != ActionEnum.left) {
          velocity.x = 1;
          velocity.y = 0;
        }
      }
    },

    // Função para gerar uma fruta em uma posição aleatória
    RandomFruit: function () {
      if (walls) {
        fruit.x = 1 + Math.floor(Math.random() * (tileCount - 2));
        fruit.y = 1 + Math.floor(Math.random() * (tileCount - 2));
      }
      else {
        fruit.x = Math.floor(Math.random() * tileCount);
        fruit.y = Math.floor(Math.random() * tileCount);
      }
    },

    // Função para logar o estado do jogo no console
    log: function () {
      console.log('====================');
      console.log('x:' + player.x + ', y:' + player.y);
      console.log('tail:' + tail + ', trail.length:' + trail.length);
    },

    // Loop principal do jogo
    loop: function () {

      reward = -0.1;

      // Função para evitar que a cobra passe pelas bordas do tabuleiro
      function DontHitWall() {
        if (player.x < 0) player.x = tileCount - 1;
        if (player.x >= tileCount) player.x = 0;
        if (player.y < 0) player.y = tileCount - 1;
        if (player.y >= tileCount) player.y = 0;
      }
      
      // Função para resetar o jogo caso a cobra colida com uma parede
      function HitWall() {
        if (player.x < 1) game.reset();
        if (player.x > tileCount - 2) game.reset();
        if (player.y < 1) game.reset();
        if (player.y > tileCount - 2) game.reset();

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, gridSize - 1, canv.height);
        ctx.fillRect(0, 0, canv.width, gridSize - 1);
        ctx.fillRect(canv.width - gridSize + 1, 0, gridSize, canv.height);
        ctx.fillRect(0, canv.height - gridSize + 1, canv.width, gridSize);
      }

      // Verifica se a cobra está parada
      var stopped = velocity.x == 0 && velocity.y == 0;

      // Atualiza a posição do jogador com base na velocidade
      player.x += velocity.x;
      player.y += velocity.y;

      // Atualiza a última ação realizada
      if (velocity.x == 0 && velocity.y == -1) lastAction = ActionEnum.up;
      if (velocity.x == 0 && velocity.y == 1) lastAction = ActionEnum.down;
      if (velocity.x == -1 && velocity.y == 0) lastAction = ActionEnum.left;
      if (velocity.x == 1 && velocity.y == 0) lastAction = ActionEnum.right;

      // Limpa o canvas
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(0, 0, canv.width, canv.height);

      // Verifica se a cobra colidiu com as paredes
      if (walls) HitWall();
      else DontHitWall();

      // Atualiza a trilha da cobra
      trail.push({ x: player.x, y: player.y });
      while (trail.length > tail) {
        trail.shift();
      }

      // Desenha as paredes
      if (walls) {
        ctx.fillStyle = 'rgba(250,250,250,0.8)';
        ctx.font = "small-caps 14px Helvetica";
        ctx.fillText("(esc) reset", 24, canv.height - 44);
        ctx.fillText("(space) pause", 24, canv.height - 26);
      }

      // Desenha a cobra
      ctx.fillStyle = 'green';
      for (var i = 0; i < trail.length - 1; i++) {
        ctx.fillRect(trail[i].x * gridSize + 1, trail[i].y * gridSize + 1, gridSize - 2, gridSize - 2);

        // Verifica se a cobra colidiu consigo mesma
        if (!stopped && trail[i].x == player.x && trail[i].y == player.y) {
          game.reset();
        }
        ctx.fillStyle = 'lime';
      }
      ctx.fillRect(trail[trail.length - 1].x * gridSize + 1, trail[trail.length - 1].y * gridSize + 1, gridSize - 2, gridSize - 2);

      // Verifica se a cobra comeu a fruta
      if (player.x == fruit.x && player.y == fruit.y) {
        if (!fixedTail) tail++;
        points++;
        if (points > pointsMax) pointsMax = points;
        reward = 1;
        game.RandomFruit();
        // Gera uma nova fruta em uma posição válida
        while ((function () {
          for (var i = 0; i < trail.length; i++) {
            if (trail[i].x == fruit.x && trail[i].y == fruit.y) {
              game.RandomFruit();
              return true;
            }
          }
          return false;
        })());
      }

      // Desenha a fruta
      ctx.fillStyle = 'red';
      ctx.fillRect(fruit.x * gridSize + 1, fruit.y * gridSize + 1, gridSize - 2, gridSize - 2);

      // Exibe a mensagem de início se a cobra estiver parada
      if (stopped) {
        document.getElementById('start-message').style.display = 'block';
      } else {
        document.getElementById('start-message').style.display = 'none';
      }

      updateInfo();

      return reward;
    }
  }

  // Função para lidar com eventos de teclado
  function keyPush(evt) {
    switch (evt.keyCode) {
      case 37:
        game.action.left();
        evt.preventDefault();
        break;

      case 38:
        game.action.up();
        evt.preventDefault();
        break;

      case 39:
        game.action.right();
        evt.preventDefault();
        break;

      case 40:
        game.action.down();
        evt.preventDefault();
        break;

      case 32:
        Snake.pause();
        evt.preventDefault();
        break;

      case 27:
        game.reset();
        evt.preventDefault();
        break;
    }
  }

  return {
    start: function (fps = 15) {
      window.onload = setup;
      intervalID = setInterval(game.loop, 1000 / fps);
    },

    loop: game.loop,

    reset: game.reset,

    stop: function () {
      clearInterval(intervalID);
    },

    setup: {
      keyboard: function (state) {
        if (state) {
          document.addEventListener('keydown', keyPush);
        } else {
          document.removeEventListener('keydown', keyPush);
        }
      },
      wall: function (state) {
        walls = state;
      },
      tileCount: function (size) {
        tileCount = size;
        gridSize = Math.min(canv.width, canv.height) / tileCount;
      },
      fixedTail: function (state) {
        fixedTail = state;
      }
    },

    action: function (act) {
      switch (act) {
        case 'left':
          game.action.left();
          break;

        case 'up':
          game.action.up();
          break;

        case 'right':
          game.action.right();
          break;

        case 'down':
          game.action.down();
          break;
      }
    },

    pause: function () {
      velocity.x = 0;
      velocity.y = 0;
    },

    clearTopScore: function () {
      pointsMax = 0;
    },

    data: {
      player: player,
      fruit: fruit,
      trail: function () {
        return trail;
      }
    },

    info: {
      tileCount: tileCount
    }
  };

})();

Snake.start(15);
Snake.setup.keyboard(true);
Snake.setup.fixedTail(false);
