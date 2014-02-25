/**
 * Define models
 *
 * @param Chilly
 * @param config
 * @param helpers
 */
module.exports = function(Chilly, config, helpers) {
    'use strict';

    /**
     * Define game
     */
    var Game = Object.create({}, {
		gameOver : {
            value: false,
            writable: true
        },
		gameActionCounter : {
            value: 0,
            writable: true
        },
		verPoints : {
            value: 4
        },
		horPoints : {
            value: 4
        },
		nowPlayer : {
            value: null,
            writable: true
        },
		userAquiredBoxCount : {
			value: 0,
            writable: true
		},
		userBoxCount : {
			value: new Object(),
            writable: true
		},
		userColors : {
			value: new Object(),
            writable: true
		},
		time: {
            value: 10,
            writable: true
        },
		gameState : {
			value: new Array(),
			writable: true,
			enumerable: true
		},
		colors : {
			value: ["#519800", "#0061B1", "#FFC900", "#DE1D1D"],
			writable: true
		},
		getGameState: {
			 value: function() {
				var ret = new Object();
				for(var i=0; i<this.verPoints ; i++){
					for(var j=0; j<this.horPoints; j++){
						ret[i+':'+j] = {'l':this.gameState[i][j]['left'], 'r':this.gameState[i][j]['right'], 't':this.gameState[i][j]['top'], 'b':this.gameState[i][j]['bottom'], 'a':this.gameState[i][j]['taken']};
					}
				}
				//return JSON.stringify(this.gameState);
				return ret;
			}
		},
		getWinner: {
            value: function() {
				var winner = "";
				var wconut = 0;
                for(var i in this.userBoxCount){
					if(wconut < this.userBoxCount[i]){
						wconut = this.userBoxCount[i];
						winner = i;
					}
				}
				return winner;
            }
        },
        id: {
            value: null,
            writable: true
        },
        players: {
            value: {},
            writable: true,
            enumerable: true
        },
        getRecipients: {
            value: function() {
                var rv = [];
                Object.keys(this.players).forEach(function(username) {
                    rv.push(this.players[username].id);
                }, this);
                return rv;
            }
        },
		getRecipientsUsernames: {
            value: function() {
                var rv = [];
                Object.keys(this.players).forEach(function(username) {
                    rv.push(username);
                }, this);
                return rv;
            }
        },
        getPlayer: {
            value: function(username) {
                return this.players[username];
            }
        },
        addPlayer: {
            value: function(player) {
				if(this.nowPlayer==null)
					this.nowPlayer = player.username;
				
                this.players[player.username] = player;
				this.userBoxCount[player.username] = 0;
				var color = this.colors.pop();
				this.userColors[player.username] = color;
				console.log(this.userColors);
				return color;
            }
        },
		removePlayer: {
            value: function(player) {
                
				this.colors.push(this.userColors[player]);
				console.log("REMOVEPLAYER METHOD:::: "+this.userColors[player]);
				delete this.players[player];
				delete this.userColors[player];
				this.gameActionCounter++;
				this.nowPlayer = Object.keys(this.players)[this.gameActionCounter % Object.keys(this.players).length];
            }
        },
        init: {
            value: function(id) {
                this.id = id;
				this.gameActionCounter = 0;
				this.userAquiredBoxCount = 0;
				this.time = 10;
				this.players = {};
				this.gameState = new Array();
				this.userBoxCount = new Object();
				this.userColors = new Object();
				this.colors = ["#519800", "#0061B1", "#FFC900", "#DE1D1D"];
				this.nowPlayer = null;
				//this.box = new Array();
				for(var i=0; i<this.verPoints ; i++){
					//this.box[i] = new Array();
					this.gameState[i] = new Array();
					for(var j=0; j<this.horPoints; j++){
						this.gameState[i][j] = new Array();
						this.gameState[i][j]['left'] = 0;
						this.gameState[i][j]['right'] = 0;
						this.gameState[i][j]['top'] = 0;
						this.gameState[i][j]['bottom'] = 0;
						this.gameState[i][j]['taken'] = '';
					}
				}
            }
        },
		checkBox: {
            value: function(x, y, player) {
				if(this.gameState[x][y]['left']==1 && 
				   this.gameState[x][y]['right']==1 &&
				   this.gameState[x][y]['top']==1 &&
				   this.gameState[x][y]['bottom']==1){
						this.gameState[x][y]['taken'] = player;
						return true;
					}
			}
		},
		process: {
            value: function(request) {
				var type = request.data.type;
				var row = request.data.row;
				var col = request.data.col;
				var aq = new Array();
				
				if(this.gameOver){
					console.log("game over");
					return;
				}
				var player = request.session.get('username');
				var twoplayers = JSON.parse(JSON.stringify(this.players));
				//delete twoplayers[player];
				
				if(this.nowPlayer == player || this.nowPlayer==null){
						console.log(this.verPoints);
						if(type=='ver'){
							if(col < this.horPoints){
								if(this.gameState[row][col]['left'] == 0) 
									this.gameState[row][col]['left'] = 1;
								else return;
								if(this.checkBox(row, col, player))
									aq.push([row, col]);
							}
							if(col-1 >= 0){
								if(this.gameState[row][col-1]['right'] == 0) 
									this.gameState[row][col-1]['right']= 1;
								else return;
								if(this.checkBox(row, col-1, player))
									aq.push([row, col-1]);
							}
						}
						
						if(type=='hor'){
							if(row < this.verPoints){
								if(this.gameState[row][col]['top'] == 0) 
									this.gameState[row][col]['top'] = 1;
								else return;									
								if(this.checkBox(row, col, player))
									aq.push([row, col]);
							} 
							if(row-1 >= 0){
								if(this.gameState[row-1][col]['bottom'] == 0) 
									this.gameState[row-1][col]['bottom'] = 1; 
								else return;
								if(this.checkBox(row-1, col, player))
									aq.push([row-1, col]);
							}
						}
						
						console.log(this.gameState);
						
						if(aq.length == 0){
							this.gameActionCounter++;
							this.nowPlayer = Object.keys(twoplayers)[this.gameActionCounter % Object.keys(twoplayers).length];
							
						}else{
							this.userAquiredBoxCount += aq.length;
							this.userBoxCount[player] += aq.length;
						}
						
						/*setTimeout(function(t){
							console.log('forceNextUser');
							var rec = t.getRecipients();
							var twoplayers = JSON.parse(JSON.stringify(t.players));
							t.gameActionCounter++;
							t.nowPlayer = Object.keys(twoplayers)[t.gameActionCounter % Object.keys(twoplayers).length];
							t.time = new Date().getTime();
							Chilly.push({
								recipients: rec,
								channel: 'update',
								data: {
									action: 'nextUser', // REQUIRED, must have the same name as the action
									nowplayer: t.nowPlayer,
									requestedBy: 'server'
								}
							});
							
						}, 10000, this);*/
						
						console.log("nowPlayer: "+this.nowPlayer +" : "+this.gameActionCounter +" : "+Object.keys(twoplayers).length+" :: "+this.gameActionCounter % Object.keys(twoplayers).length);
						
						this.time = new Date().getTime();
						console.log("this.time: "+this.time);
						if(this.userAquiredBoxCount == ((this.verPoints) * (this.horPoints))){
							return {"action":"win", "user": this.getWinner(), "value": {"type":type, "row":row, "col":col}, "aquired" : aq, "nowplayer": this.nowPlayer};
							this.gameOver = true;
							//this.nowPlayer = this.newgame();
						}
						console.log("aquired: "+this.userAquiredBoxCount);
						return {"action":"move", "value": {"type":type, "row":row, "col":col}, "aquired" : aq, "nowplayer": this.nowPlayer};

				}
            }
        },
		newgame: {
            value: function() {
				this.gameActionCounter = 1;
				this.userAquiredBoxCount = 0;
				this.time = 10;
				var randPlayer = Object.keys(this.players);
				var randKey = Math.floor(Math.random() * (randPlayer.length));
				this.gameState = new Array();
				//this.userBoxCount = new Object();
				
				for(var i in this.userBoxCount)
					this.userBoxCount[i] = 0;
				
				this.colors = ["#519800", "#0061B1", "#FFC900", "#DE1D1D"];
				this.nowPlayer = randPlayer[randKey];
				//this.box = new Array();
				for(var i=0; i<this.verPoints ; i++){
					//this.box[i] = new Array();
					this.gameState[i] = new Array();
					for(var j=0; j<this.horPoints; j++){
						this.gameState[i][j] = new Array();
						this.gameState[i][j]['left'] = 0;
						this.gameState[i][j]['right'] = 0;
						this.gameState[i][j]['top'] = 0;
						this.gameState[i][j]['bottom'] = 0;
						this.gameState[i][j]['taken'] = '';
					}
				}
				//console.log(this.gameState);
				return randPlayer[randKey];
            }
        }
    });

    /**
     * Export the models
     */
    return {
        Game: Game
    };
};