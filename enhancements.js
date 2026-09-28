(() => {
  "use strict";

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  // ---------------------------------------------------------------------------
  // Rockstar: multi-variant Rock-Paper-Scissors match engine
  // ---------------------------------------------------------------------------
  const variants = {
    classic: {
      moves: ["rock","paper","scissors"],
      beats: {
        rock: ["scissors"],
        paper: ["rock"],
        scissors: ["paper"]
      },
      verbs: {
        "rock|scissors":"crushes",
        "paper|rock":"covers",
        "scissors|paper":"cuts"
      }
    },
    rpsls: {
      moves: ["rock","paper","scissors","lizard","spock"],
      beats: {
        rock: ["scissors","lizard"],
        paper: ["rock","spock"],
        scissors: ["paper","lizard"],
        lizard: ["spock","paper"],
        spock: ["scissors","rock"]
      },
      verbs: {
        "rock|scissors":"crushes",
        "rock|lizard":"crushes",
        "paper|rock":"covers",
        "paper|spock":"disproves",
        "scissors|paper":"cuts",
        "scissors|lizard":"decapitates",
        "lizard|spock":"poisons",
        "lizard|paper":"eats",
        "spock|scissors":"smashes",
        "spock|rock":"vaporizes"
      }
    }
  };

  let gameKey = "classic";
  let selectedMove = null;
  let rivalMove = null;
  let youScore = 0;
  let cpuScore = 0;
  let ties = 0;
  let matchOver = false;

  function cloneReplace(el){
    const clone = el.cloneNode(true);
    el.replaceWith(clone);
    return clone;
  }

  let rpsRun = cloneReplace($("#rps-run"));
  let rpsReset = cloneReplace($("#rps-reset"));
  const rpsButtons = $("#rps-buttons");

  function targetWins(){
    return Math.max(1, Number($("#rps-match")?.value || 1));
  }

  function rockstarSource(){
    const move = selectedMove || variants[gameKey].moves[0];
    const rival = rivalMove || "mysterious";
    let code = `My move is "${move}"\nThe rival is ${rival === "mysterious" ? "mysterious" : `"${rival}"`}\n\nIf my move is the rival\n  Shout "ENCORE"`;
    if(rival !== "mysterious"){
      if(move !== rival){
        const youWin = variants[gameKey].beats[move].includes(rival);
        const winner = youWin ? "YOU WIN" : "ROCKSTAR WINS";
        code += `\n\nIf my move is "${move}" and the rival is "${rival}"\n  Shout "${winner}"`;
      }
    } else {
      for(const beaten of variants[gameKey].beats[move]){
        code += `\n\nIf my move is "${move}" and the rival is "${beaten}"\n  Shout "YOU WIN"`;
      }
    }
    $("#rockstar-source-view").textContent = code;
  }

  function updateScore(){
    $("#rps-you-score").textContent = `You ${youScore}`;
    $("#rps-cpu-score").textContent = `Rockstar ${cpuScore}`;
    $("#rps-ties").textContent = `Ties ${ties}`;
  }

  function renderMoveButtons(){
    rpsButtons.innerHTML = "";
    const moves = variants[gameKey].moves;
    rpsButtons.style.gridTemplateColumns = `repeat(${Math.min(moves.length,5)}, minmax(0,1fr))`;
    for(const move of moves){
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.move = move;
      b.textContent = move.toUpperCase();
      b.addEventListener("click",()=>{
        if(matchOver) return;
        selectedMove = move;
        rivalMove = null;
        $$("#rps-buttons button").forEach(x=>x.classList.toggle("selected",x===b));
        $("#rps-answer").textContent = `${move.toUpperCase()} selected.`;
        $("#rps-detail").textContent = "Press ROCK ON to play the round.";
        rockstarSource();
      });
      rpsButtons.appendChild(b);
    }
  }

  function resetMatch(){
    gameKey = $("#rps-variant")?.value || "classic";
    selectedMove = null;
    rivalMove = null;
    youScore = 0;
    cpuScore = 0;
    ties = 0;
    matchOver = false;
    updateScore();
    renderMoveButtons();
    $("#rps-answer").textContent = "Choose a move.";
    const target = targetWins();
    $("#rps-detail").textContent = target === 1 ? "Single round." : `First to ${target} wins the match.`;
    rockstarSource();
  }

  function playRound(){
    if(matchOver){
      $("#rps-detail").textContent = "Reset the match to play again.";
      return;
    }
    if(!selectedMove){
      $("#rps-answer").textContent = "Choose a move first.";
      return;
    }
    const moves = variants[gameKey].moves;
    rivalMove = moves[Math.floor(Math.random()*moves.length)];

    let result, detail;
    if(selectedMove === rivalMove){
      ties++;
      result = "ENCORE — TIE.";
      detail = `Both chose ${selectedMove.toUpperCase()}.`;
    }else if(variants[gameKey].beats[selectedMove].includes(rivalMove)){
      youScore++;
      const verb = variants[gameKey].verbs[`${selectedMove}|${rivalMove}`] || "beats";
      result = "YOU WIN 🤘";
      detail = `${selectedMove.toUpperCase()} ${verb} ${rivalMove.toUpperCase()}.`;
    }else{
      cpuScore++;
      const verb = variants[gameKey].verbs[`${rivalMove}|${selectedMove}`] || "beats";
      result = "ROCKSTAR WINS.";
      detail = `${rivalMove.toUpperCase()} ${verb} ${selectedMove.toUpperCase()}.`;
    }

    updateScore();
    rockstarSource();

    const target = targetWins();
    if(youScore >= target || cpuScore >= target){
      matchOver = true;
      const winner = youScore > cpuScore ? "YOU WIN THE MATCH." : "ROCKSTAR WINS THE MATCH.";
      $("#rps-answer").textContent = winner;
      $("#rps-detail").textContent = detail + ` Final score: ${youScore}–${cpuScore}.`;
    }else{
      $("#rps-answer").textContent = result;
      $("#rps-detail").textContent = detail + (target > 1 ? ` Score: ${youScore}–${cpuScore}.` : "");
    }
  }

  $("#rps-variant")?.addEventListener("change",resetMatch);
  $("#rps-match")?.addEventListener("change",resetMatch);
  rpsRun.addEventListener("click",playRound);
  rpsReset.addEventListener("click",resetMatch);
  resetMatch();

  // ---------------------------------------------------------------------------
  // Befunge: selectable maze library
  // ---------------------------------------------------------------------------
  const mazes = {
    switchback: {
      name:"Switchback",
      rows:[
        "#########",
        "#S#     #",
        "# # ### #",
        "# #   # #",
        "# ### # #",
        "#     #G#",
        "#########"
      ]
    },
    spiral: {
      name:"Spiral",
      rows:[
        "#########",
        "#S      #",
        "### ### #",
        "#   #   #",
        "# ### # #",
        "#     #G#",
        "#########"
      ]
    },
    crossroads: {
      name:"Crossroads",
      rows:[
        "#########",
        "#S  #   #",
        "# # # # #",
        "# #   # #",
        "# ### # #",
        "#     #G#",
        "#########"
      ]
    }
  };

  const oldControls = $(".maze-controls");
  const newControls = cloneReplace(oldControls);
  let mazeReset = cloneReplace($("#maze-reset"));
  let mazeKey = "switchback";
  let mazeRowsLocal = mazes[mazeKey].rows;
  let mazePosLocal = {r:1,c:1};
  let mazeMoves = 0;

  function findStart(rows){
    for(let r=0;r<rows.length;r++){
      const c=rows[r].indexOf("S");
      if(c>=0) return {r,c};
    }
    return {r:1,c:1};
  }

  function mazeSource(){
    const rows = mazeRowsLocal.map((row,r)=>[...row].map((ch,c)=>{
      if(mazePosLocal.r===r && mazePosLocal.c===c) return "@";
      return ch;
    }).join(""));
    $("#befunge-source-view").textContent = rows.join("\n");
  }

  function renderMaze(){
    const box=$("#maze");
    box.innerHTML="";
    box.style.gridTemplateColumns=`repeat(${mazeRowsLocal[0].length}, 28px)`;
    mazeRowsLocal.forEach((row,r)=>[...row].forEach((ch,c)=>{
      const d=document.createElement("div");
      d.className="maze-cell";
      if(ch==="#") d.classList.add("wall");
      if(ch==="G") d.classList.add("goal");
      if(mazePosLocal.r===r && mazePosLocal.c===c){
        d.classList.add("player");
        d.textContent="@";
      }else if(ch==="G") d.textContent="G";
      else if(ch==="S") d.textContent="S";
      box.appendChild(d);
    }));
    mazeSource();
  }

  function resetMaze(){
    mazeKey=$("#maze-select")?.value || "switchback";
    mazeRowsLocal=mazes[mazeKey].rows;
    mazePosLocal=findStart(mazeRowsLocal);
    mazeMoves=0;
    renderMaze();
    $("#maze-answer").textContent=`${mazes[mazeKey].name}: find the exit.`;
    $("#maze-detail").textContent="0 moves";
  }

  function moveMaze(dir){
    const delta={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]}[dir];
    if(!delta) return;
    const nr=mazePosLocal.r+delta[0],nc=mazePosLocal.c+delta[1];
    if(nr<0||nr>=mazeRowsLocal.length||nc<0||nc>=mazeRowsLocal[0].length||mazeRowsLocal[nr][nc]==="#"){
      $("#maze-detail").textContent=`Wall · ${mazeMoves} move${mazeMoves===1?"":"s"}`;
      return;
    }
    mazePosLocal={r:nr,c:nc};
    mazeMoves++;
    renderMaze();
    if(mazeRowsLocal[nr][nc]==="G"){
      $("#maze-answer").textContent="EXIT FOUND.";
      $("#maze-detail").textContent=`${mazes[mazeKey].name} solved in ${mazeMoves} moves.`;
    }else{
      $("#maze-answer").textContent="Keep going.";
      $("#maze-detail").textContent=`Row ${nr}, column ${nc} · ${mazeMoves} move${mazeMoves===1?"":"s"}`;
    }
  }

  $$(".maze-controls button").forEach(b=>b.addEventListener("click",()=>moveMaze(b.dataset.dir)));
  mazeReset.addEventListener("click",resetMaze);
  $("#maze-select")?.addEventListener("change",resetMaze);
  resetMaze();
})();