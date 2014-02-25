/**
 * Define actions
 *
 * @param Chilly
 * @param models
 * @param config
 * @param helpers
 */
module.exports = function(Chilly, models, config, helpers) {
    'use strict';

    /**
     * Define user channels (! MAX 5! )
     */
    Chilly.createChannel('chat');

    /**
     * Respond to a login request
     */
    Chilly.action('login', {		
        user: function(request) {
            console.log("CALL TO ACTION LOGIN gameId = " + request.session.get('gameId'));
			
			var Game = Chilly.getGame(request.session.get('gameId'));
			if(!Game){
				joinGame(request);
			}else{
				var mychance = Game.nowPlayer == request.session.get('username');
				var timeLeft = Math.floor(10 - (new Date().getTime() - Game.time)/1000);
				request.respond.ok({'gameid': request.session.get('gameId'), 'timeLeft':timeLeft, 'nowplayer': Game.nowPlayer, 'mychance': mychance,'myid': request.session.get('username'), '':request.session.get('gameId'), 'mycolor':request.session.get('color'), 'opcolor':Game.userColors, 'restore':Game.gameState,'message':'Already logged in.'});
			}
	   },
        anonymous: function(request) {
			console.log("CALL TO anonymous ACTION LOGIN gameId = " + request.session.get('gameId'));
						
            var Game,
                username = request.data.username.substring(0,20);
			if(username==false || username==null || username=='' || Chilly.Clients[username] != null)
				username = username+ Math.floor(Math.random()*1001);
			
			request.session.set('clientId', username);
            Chilly.addClient(username);
			
			request.session.set('auth', true);
			request.session.set('username', username);
			
			joinGame(request);
       }
    });
	
	/**
     * Respond to a is user loged in request
     */
    Chilly.action('isLoggedIn', {
        user: function(request) {
			//var opcolor = "";
			//if(request.session.get('color')=="#DE1D1D")
			//	opcolor = "#FFC900";
		//	else opcolor = "#DE1D1D";
            console.log("isLoggedIn : user" + JSON.stringify(Chilly.Clients));
			if(!Chilly.Clients[request.session.get('username')]){
				console.log("Destroying");
				//request.session.destroyAll();
				request.session.destroy('username');
				request.session.destroy('gameid');
				request.session.destroy('color');
				request.session.destroy('auth');
				request.session.destroy('clientId');
				request.session.destroy('lastAccess');
				//request.session.destroy('cookie');
				request.respond.error({'response': false});
				return false;
			}
			
			var Game = Chilly.getGame(request.session.get('gameId'));
			if(!Game){
				joinGame(request);
			}else{
				var mychance = Game.nowPlayer == request.session.get('username');
				var timeLeft = Math.floor(10 - (new Date().getTime() - Game.time)/1000);
				request.respond.ok({'gameid': request.session.get('gameId'), 'timeLeft':timeLeft, 'nowplayer': Game.nowPlayer, 'mychance': mychance, 'myid': request.session.get('username'), 'mycolor':request.session.get('color'), 'opcolor':Game.userColors, 'restore':Game.getGameState(),'message':'Already logged in.'});
			}
		},
        anonymous: function(request) {
			console.log("isLoggedIn : anonymous");
			request.respond.error({'response': false});
       }
    });

	
	function joinGame(request){
		var username = request.session.get('username');
		var gameKeys = Object.keys(Chilly.Games);
		var Game; 
		/*
		var tGame = Chilly.getGame(request.session.get('gameId'));
		if(tGame){
			tGame.removePlayer(request.session.get('username'));
			if(tGame.getRecipients().length == 0)
				Chilly.removeGame(request.session.get('gameId'));
		}*/
		
		request.session.destroy('gameId');
		
		for(var i in Chilly.Games){
			console.log(Chilly.Games[i].getRecipients().length);
		}
		
            if(Object.keys(Chilly.Games).length === 0 || Chilly.Games[gameKeys[gameKeys.length-1]].getRecipients().length === 4){
                Game = Chilly.createGame();
            } else {
                Game = Chilly.Games[Chilly.Games[Object.keys(Chilly.Games)[Object.keys(Chilly.Games).length-1]]['id']];
            }
			
			console.log("JOIN GAMES : : : " + Object.keys(Chilly.Games));
			
			if(Game.getRecipients().length < 4){
			
				var color = Game.addPlayer({
					"username": username,
					"id": request.getClientId()
				});
				
				request.session.set('gameId', Game.id);
				request.session.set('color', color);
					
				var Gamex = Chilly.getGame(request.session.get('gameId'));
				var all = Gamex.getRecipients();
				var timeLeft = Math.floor(10 - (new Date().getTime() - Game.time)/1000);
				
				Chilly.push({
					recipients: all,
					channel: 'update',
					data: {
						action: 'joined',
						color: color,
						opcolor: Game.userColors,
						nowplayer: Game.nowPlayer,
						timeLeft: timeLeft,
						restore: Game.getGameState(),
						requestedBy: request.session.get('username')
					}
				});
				
				request.respond.ok({'mycolor':color, 'timeLeft':timeLeft, 'restore':Game.getGameState(), 'opcolor':Game.userColors, 'nowplayer': Game.nowPlayer, 'myid': username, 'gameid': request.session.get('gameId')});
				
			}else{
				request.respond.error({'message':'server full'});
				console.log("ida na");
			}
			
			console.log("COLOR:::::"+color);
	}

    /**
     * Respond to a chat request
     */
    Chilly.action('sendChat', {
        user: function(request) {
            var Game = Chilly.getGame(request.session.get('gameId'));
			if(Game == null) return;
            Chilly.push({
                recipients: Game.getRecipients(),
                channel: 'chat',
                data: {
                    player: request.session.get('username'),
                    message: request.data.message,
                    datetime: new Date()
                }
            });
            request.respond.ok('Message sent.');
        }
    });

	
	/**
     * Respond to a join to a game request
     */
    Chilly.action('join', {
        user: function(request) {

        }
    });
	
	 /**
     * Respond to a updateme request
     */
    Chilly.action('updateme', {
        user: function(request) {
			console.log("CALL TO ACTION updateme gameId = " + request.session.get('gameId'));
            var Game = Chilly.getGame(request.session.get('gameId'));
			if(!Game) return;
			console.log("updateme -- " + request.getClientId());
			var timeLeft = Math.floor(10 - (new Date().getTime() - Game.time)/1000);		
            Chilly.push({
                recipients: [request.getClientId()],
                channel: 'update',
                data: {
                    action: 'updateme', // REQUIRED, must have the same name as the action
                    restore: Game.getGameState(),
					timeLeft: timeLeft,
					opcolor: Game.userColors,
					nowplayer: Game.nowPlayer,
                    requestedBy: request.session.get('username')
                }
            });
			console.log("update requested : "+JSON.stringify(request.getClientId()));
            request.respond.ok('Message sent.');
        }
    });
	
    /**
     * Respond to a played request
     */
    Chilly.action('played', {
        user: function(request) {
            var Game = Chilly.getGame(request.session.get('gameId'));
			if(Game){
				var state = Game.process(request);
			}else{ 
				request.respond.error('error');
				return false;
			}
			
			var timeLeft = Math.floor(10 - (new Date().getTime() - Game.time)/1000);
			if(!Game) return;
            Chilly.push({
                recipients: Game.getRecipients(),
                channel: 'update',
                data: {
                    action: 'played', // REQUIRED, must have the same name as the action
                    value: state,
					timeLeft: timeLeft,
                    requestedBy: request.session.get('username')
                }
            });
			
            request.respond.ok('Message sent.');
        }
    });
	
	/**
     * Respond to a newgame request
     */
    Chilly.action('newgame', {
        user: function(request) {
            var Game = Chilly.getGame(request.session.get('gameId'));
			if(!Game) return;
			var newStarter = Game.newgame();
			Game.nowPlayer = newStarter;
            Chilly.push({
                recipients: Game.getRecipients(),
                channel: 'update',
                data: {
                    action: 'newgame',
                    starter: newStarter,
                    requestedBy: request.session.get('username')
                }
            });
            request.respond.ok('Message sent.'+Game.nowPlayer);
        }
    });
	
	/**
     * Respond to a leavegame request
     */
    Chilly.action('leavegame', {
        user: function(request) {
            var Game = Chilly.getGame(request.session.get('gameId'));
			if(!Game) return;
			
			var user = request.session.get('username');
			
			if(user == Game.nowPlayer){
				var twoplayers = JSON.parse(JSON.stringify(Game.players));
				Game.gameActionCounter++;
				Game.nowPlayer = Object.keys(twoplayers)[Game.gameActionCounter % Object.keys(twoplayers).length];
			}
			
			Game.removePlayer(user);
			
            Chilly.push({
                recipients: Game.getRecipients(),
                channel: 'update',
                data: {
                    action: 'leavegame',
                    left: true,
					nowplayer: Game.nowPlayer,
					timeLeft: null,
					gameID: request.session.get('gameId'),
                    requestedBy: user
                }
            });
			
			console.log("game : "+JSON.stringify(Chilly.Games));
			request.session.destroy('gameId');
			request.respond.ok('Left');
        }
    });
	
	
	/**
     * Respond to a joingame request
     */
    Chilly.action('joingame', {
        user: function(request) {
			joinGame(request);
        }
    });


};