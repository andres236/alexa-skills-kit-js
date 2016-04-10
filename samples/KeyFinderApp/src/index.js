/**
 * This is an Alexa skill allow user to set and remind them the location of their key 
 * Built using the Amazon Alexa Skills Kit.
 * 
 */
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.a7cd8c09-3ea3-4d5a-ae6c-1e9fa99c056b") {
             context.fail("Invalid Application ID");
        }
        
        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }
        
        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request, event.session,function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
                
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
                
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
        
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to welcome response
    getWelcomeResponse(session, callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("SetKeyLocationIntent" === intentName) {
    	setKeyInSession(intent, session, callback);
    } else if ("WhereMyKeyIntent" === intentName) {
        getKeyFromSession(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
    	helpIntent(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
    	stopIntent(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(session, callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {}
    var cardTitle = "Welcome to Key Finder";
    var speechOutput = "";
    var repromptText = "";
    var shouldEndSession = false;
    
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    if (!session.new) 
    {
        keyLocation = session.attributes.keyLocation;
        sessionAttributes = createKeyLocationAttributes(keyLocation);
        speechOutput = "Your key is located in " + keyLocation;
    }
    else 
    {
        speechOutput = "Welcome to the Key Finder Application. " +
        "Please let me help you find your key, tell me where is your key?";
    
        repromptText = "I did not understand you, Please tell me where is your key?";
    }

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, false));
}

/**
 * Sets key in the session and prepares the speech to reply to the user.
 */
function setKeyInSession(intent, session, callback) {
    var cardTitle = "Key Location";
    var keyLocationSlot = intent.slots.Location;
    var repromptText = "";
    var sessionAttributes = {};
    var speechOutput = "";
    var shouldEndSession;
    var keyLocation;

    if(keyLocationSlot) 
    {
        keyLocation = keyLocationSlot.value;
        sessionAttributes = createKeyLocationAttributes(keyLocation);
        speechOutput = "Your key is found in the " + keyLocation + ". You can ask key finder, where is my key?";
        repromptText = "I did not understand you, you can ask key finder, where is my key? or say stop to exit.";
    }
    else {
        speechOutput = "I'm not sure where your key is located. Please try again";
        repromptText = "I'm not sure where your key is located. You can tell me where " +
            "is your key located, my key is located in kitchen";
    }

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, false));
         
}

function createKeyLocationAttributes(keyLocation) {
    return {
        keyLocation: keyLocation
    };
}

function getKeyFromSession(intent, session, callback) {
    var keyLocation;
    var cardTitle = "Where is my key?";
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    
    if (session.attributes) 
    {
        keyLocation = session.attributes.keyLocation;
        sessionAttributes = createKeyLocationAttributes(keyLocation);
    }

    if (keyLocation) {
        speechOutput = "Your key is found in " + keyLocation + ". You can say stop to exit";
        repromptText = "I did not understand you. You can ask key finder, where is my key? or say stop to exit.";
        shouldEndSession = false;
        
    } else {
        speechOutput = "I'm not sure where your key is located. You can say, key finder my key is located in the kitchen ";
        repromptText = "You can say, my key is in kitchen";
        shouldEndSession = false;
    }

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function helpIntent(intent, session, callback) {
		var keyLocation;
		var sessionAttributes = {};
	    var cardTitle = "KeyFinder - Help";
	    var speechOutput = "Key Finder skill will remember where you last place your key. " +
	        "To use the Key Finder, try saying, where is my key? , or you can say stop to exit.";
	    var repromptText = "Please let me know how I may help you find your key?";
	        //, " +
	        //"where is my key?";
	    var shouldEndSession = false;

	    if (session.attributes) {
	        keyLocation = session.attributes.keyLocation;
	       sessionAttributes = createKeyLocationAttributes(keyLocation);

	    }
	    
	    callback(sessionAttributes,
	        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function stopIntent(callback) {
	var sessionAttributes = {};
    var cardTitle = "Goodbye";
    var speechOutput = "Thank you for using Key Finder App. Goodbye";
    var repromptText = "";
    var shouldEndSession = true;

    callback(sessionAttributes,
	        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// --------------- Helpers that build all of the responses -----------------------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}