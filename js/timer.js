var $j = jQuery.noConflict();   
var timeoutID        = null;
var Timer;
var TotalSeconds;
var secs;
var warmupstart      = 1;
var warmup;
var cycles;
var repeat;
var workout;
var currCycle        = 0;
var totTimeRemaining = 0;
var workoutType      = 1; // 1: Basic and 2: Advanced
var valRounds;

var setTimerArray = new Array();                                
var setTimer = 0;
var incTimerID = null;

var sound_warm_up    = 0;
var sound_hit        = 0;
var sound_lit        = 0;
var sound_rest       = 0;
var sound_colldown   = 0;
var sound_3_2_1      = 0;
var sound_next_round = 0;
var sound_rest_bt_repeats = 0;

var val321 = Array();
var currRunningTimer = 0;

var volume = 60; 

var setValueIntervals = 200;         

function loadSettings(){
    Timer  = document.getElementById("timer");
    $j("#tt_sound").html("&nbsp;");
    $j("#chkOmitInterval").removeAttr("disabled");
    $j('#transbox').css("display","none");
    $j('#divPause').css("display","none");
    $j('#divResume').css("display","none");
    $j('#divStop').css("display","none");
    $j('#divStart').css("display","block");
    
    timeoutID        = null;
    Timer            = 0;
    TotalSeconds     = 0;
    secs             = 0;
    warmupstart      = 1;
    warmup           = 0;
    cycles           = 0;
    repeat           = 0;
    workout          = 0;
    currCycle        = 0;
    totTimeRemaining = 0;
    
    sound_warm_up    = 0;
    sound_hit        = 0;
    sound_lit        = 0;
    sound_rest       = 0;
    sound_colldown   = 0;
    sound_3_2_1      = 0;
    sound_next_round = 0;
    sound_rest_bt_repeats = 0;
    
    cycles = parseInt($j('#rounds').html());
    repeat = parseInt($j('#repeats').html());
    
    $j('#CurrentTimer').html("Warm Up");
    TotalSeconds = toSeconds($j('#warmup').html());
    
    applyClass('warmup');
    $j('#CurrentTimer').html("Warm Up");
    $j('#timer').html($j('#warmup').html());
    
    totalTime();
}

function loadSlider(){
    loadSettings();
    $j(function() {
        $j( "#slider" ).slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: 100,
            value: 60,
            slide: function( event, ui ) {
                $j( "#volume" ).html( ui.value );
                volume = ui.value;
                $j( ".timersound" ).attr("volume",ui.value+"%");
            }
        });
        $j( "#volume" ).html( $j( "#slider" ).slider( "value" ) );
        volume = $j( "#slider" ).slider( "value" )+"%";
		//alert(volume);
        $j( ".timersound" ).attr("volume", volume+"%");
		//alert($j( ".timersound" ).attr("volume"));
    });
}


jQuery(document).ready(function($) {
    /*$j("#chkOmitInterval").click(function (){
        totalTime();
    }); */   
    
  /*
  * When user click on Advanced link then this event get generated
  */
  $j('#btnAdv').click(function() {
        if (workoutType != 2){
            $('#curr-color').animate({ 
                 height: '+=66'
                }, 'slow', function() {
                // Animation complete.
            });
        }
        $j('#advDiv').slideDown('slow',function(){   
            $j('#btnAdv').removeClass().addClass("button-active");
            $j('#btnBasic').removeClass().addClass("button-inactive");
            $j('#advRoundRemaining').removeClass("basicRemaining").addClass("advRemaining");
            $j('#advRepeatRemaining').removeClass("basicRemaining").addClass("advRemaining");
            $j('#advTotTimeRemaining').removeClass("basicRemaining").addClass("advRemaining");
            $j("#advRepeatRemaining").fadeIn("slow");
            $j("#omitlastinterval").fadeOut("slow"); 
        });
        workoutType = 2;                                                                      
        loadSettings();
    });
    
    /*
    * When user click on Basic link then this event get generated
    */
    $j('#btnBasic').click(function() {
        if (workoutType != 1){
            $('#curr-color').animate({ 
                    height: '-=66'
                  }, 1000, function() {
                    // Animation complete.
            });
        }
        $j("#advRepeatRemaining").fadeOut("slow");
        $j("#omitlastinterval").fadeIn("slow"); 
        $j('#advDiv').slideUp('slow',function(){
            //$j('#advDiv').slideUp('slow');
            $j('#btnBasic').removeClass().addClass("button-active");
            $j('#btnAdv').removeClass().addClass("button-inactive");
            $j('#advRoundRemaining').removeClass("advRemaining").addClass("basicRemaining");
            $j('#advTotTimeRemaining').removeClass("advRemaining").addClass("basicRemaining");
        });  
        workoutType = 1;
        loadSettings();
        
    });
}); 

/*
*  This function get executed when user click on start button
*/
function CreateTimer(TimerID) {
    /*
    * Store timer into an array.
    * These are the static values.
    */
    setTimerArray[0]  = toSeconds($j('#warmup').html());
    setTimerArray[1]  = toSeconds($j('#hit').html());
    setTimerArray[2]  = toSeconds($j('#lit').html());
    setTimerArray[3]  = toSeconds($j('#rest').html()); 
    setTimerArray[4]  = toSeconds($j('#cooldown').html());
    setTimerArray[5]  = toSeconds($j('#restbtwrepeat').html());
    
    /*
    * If user set all the timer to zero then timer should not run
    * User has to set the at least one timer i.e. Warm Up, High Intensity, Low Intensity or Rest
    */
    if (setTimerArray[0] == 0 && setTimerArray[1] == 0 && setTimerArray[2] == 0 && setTimerArray[3] == 0){
        return false;
    }
    
    /*
    * Thsi is the transperant Div, get activated when user click on start button
    */
    $j('#transbox').css("display","block");
    
    /*
    * Buttons Start, Stop, Resume, Pause
    */
    $j("#chkOmitInterval").attr("disabled", true);
    $j('#divResume').css("display","none");
    $j('#divStart').css("display","none");
    $j('#divStop').css("display","block");
    $j('#divPause').css("display","block");
    
    Timer  = document.getElementById(TimerID);
    
    /*
    * Number of rounds
    */
    cycles = parseInt($j('#rounds').html());
    
    /*
    * For basic version repeat is always set to 1
    * For advanced version user can change the value, but not less than 1
    */
    if (workoutType == 1){ // Basic
        repeat = 1;
    }else{ // Advanced
        repeat = parseInt($j('#repeats').html());
    }
    
    /*
    * Start up value
    * If user set Warm Up timer, then timer will start from warm up
    * If the user set Warm Up timer to zero and High Intensity to some value, then timer will start from High Intensity
    * If the user set Warm Up timer and High Intensity timer to zero and Low Intensity to some value, then timer will start
    * from Low Intensity
    */
    if (setTimerArray[0] > 0){
        val321[0] = 2;
        val321[1] = "warmup";
        sound_warm_up= 1;
        playSound();
        applyClass('warmup');
        $j('#CurrentTimer').html("Warm Up");
        TotalSeconds = toSeconds($j('#warmup').html());
        currCycle    = 1;
        setTimer = 1;
    }else if (setTimerArray[1] > 0){     
        applyClass('hit'); 
        $j('#CurrentTimer').html("High Intensity");
        TotalSeconds = toSeconds($j('#hit').html());
        val321[0]    = 3;
        val321[1]    = "sound_hit" ;
        sound_3_2_1  = 1;
        sound_hit    = 0;
        currCycle    = 2;
        setTimer = 2;
    }else if (setTimerArray[2] > 0){
        val321[0]    = 3;
        val321[1]    = "sound_lit" ;
        sound_lit    = 0;
        sound_3_2_1  = 1;
        //playSound();
        applyClass('lit'); 
        $j('#CurrentTimer').html("Low Intensity");
        TotalSeconds = toSeconds($j('#lit').html());
        currCycle    = 3;
        setTimer = 3;
    }
    else if (setTimerArray[3] > 0){
        val321[0] = 0;
        val321[1] = "";
        sound_rest    = 1;
        playSound();
        applyClass('rest'); 
        $j('#CurrentTimer').html("Rest");
        TotalSeconds = toSeconds($j('#rest').html());
        currCycle    = 4;
        setTimer = 4;
    }
    
    /*
    * if val321 is set to zero then normal timer will get start
    * otherwise execute321 timer will get start
    * The use of this timer is to hold the timer for 3 seconds so that the actual timer doen't get start until
    * sound (3..2..1) has finished.
    */
    if (val321[0] == 0){
        UpdateTimer()
        timeoutID = window.setTimeout("Tick()", 1000);
    }else{                           
        timeoutID321 = window.setTimeout("execute321()", 1000);
    }
}

/*
* Hold timer for 3 seconds and play a sound 3..2..1
*/
function execute321(){
    currRunningTimer = 2;
    val321[0] -= 1;
    if (val321[0] >= 0){  
        playSound(); 
        timeoutID321 = window.setTimeout("execute321()", 1000);
    }else{ 
        if (val321[1] == "sound_hit")
            sound_hit = 1;
        else if (val321[1] == "sound_lit")
            sound_lit = 1;
        else if (val321[1] == "warmup")
            sound_warm_up = 2;
                     
        UpdateTimer();
        timeoutID = window.setTimeout("Tick()", 1000);
    }
}

/*
* This is the function where actual timer is running
* This function is automatically called after every second
*/
function Tick(){
    currRunningTimer = 1;
    if (TotalSeconds > 0){
        TotalSeconds     -= 1;
        totTimeRemaining -= 1;
    }
    
    /*
    * High Intensity timer
    */ 
    if (setTimerArray[1] > 0 && TotalSeconds == 0 && currCycle == 1 && cycles > 0){  
        applyClass('hit');
        $j('#CurrentTimer').html("High Intensity");
        TotalSeconds =  setTimerArray[1];
        sound_hit    = 1;
        currCycle    = 2;
        setTimer = 1;
    }else if (setTimerArray[1] <= 0 && TotalSeconds == 0 && currCycle == 1 && cycles > 0){
        currCycle    = 2;
        setTimer = 1;
    }
    
    /*
    * Low Intensity timer
    */
    if (setTimerArray[2] > 0 && TotalSeconds == 0 && currCycle == 2 && cycles > 0){ 
        applyClass('lit');
        $j('#CurrentTimer').html("Low Intensity");
        TotalSeconds =  setTimerArray[2];
        sound_lit    = 1;
        currCycle    = 3;
        setTimer = 2;
    }else if (setTimerArray[2] <= 0 && TotalSeconds == 0 && currCycle == 2 && cycles > 0){
        currCycle    = 3;    
        setTimer = 2;
    }
    
    /*
    * Rest timer
    * Rest between two rounds
    */
    if (workoutType == 2){ // Advanced
        if (setTimerArray[3] > 0 && TotalSeconds == 0 && currCycle == 3 && cycles > 1 && repeat > 0){
            applyClass('rest');
            $j('#CurrentTimer').html("Rest");
            TotalSeconds =  setTimerArray[3];
            sound_rest    = 1;
            currCycle    = 4;
            setTimer = 3;
        }else if (setTimerArray[3] > 0 && TotalSeconds == 0 && currCycle == 3 && cycles > 1 && repeat > 1){
            currCycle    = 4;
            setTimer = 3;
        }else if (setTimerArray[3] <= 0 && TotalSeconds == 0 && currCycle == 3 && cycles > 1 && repeat >= 1){
            currCycle    = 4;
            setTimer = 3; 
        }
    }else if (workoutType == 1){ // Basic
        if (setTimerArray[3] > 0 && TotalSeconds == 0 && currCycle == 3 && cycles > 0){
            /*
            * Omit last Rest Interval 
            */
            if (cycles == 1 && repeat == 1 && $j("#chkOmitInterval").is(':checked')){
                currCycle    = 4;
                setTimer = 3;
                TotalSeconds = 0;
            }else{ 
                applyClass('rest');
                $j('#CurrentTimer').html("Rest");
                TotalSeconds =  setTimerArray[3];
                sound_rest    = 1;
                currCycle    = 4;
                setTimer = 3; 
            }
        }else if (setTimerArray[3] <= 0 && TotalSeconds == 0 && currCycle == 3 && cycles > 0){
            currCycle    = 4;
            setTimer = 3;
        }                                     
    }
    
    /*
    * Rest between repeats timer
    */
    if (workoutType == 2 && setTimerArray[5] > 0 && TotalSeconds == 0 && repeat > 1 && currCycle == 3 && cycles == 1 ){ 
        applyClass('restbtwrepeat');
        $j('#CurrentTimer').html("Rest Between Repeats");
        TotalSeconds =  setTimerArray[5];
        sound_rest_bt_repeats    = 1;
        currCycle    = 4;
        setTimer = 3;
    }else if(workoutType == 2 && setTimerArray[5] <= 0 && TotalSeconds == 0 && repeat > 1 && currCycle == 3 && cycles == 1 ){
        currCycle    = 4;
        setTimer = 3;
    }
    
    /*
    * Reduce round/cycle and repeat by one
    */
    if (workoutType == 2 && TotalSeconds == 0 && repeat == 1 && cycles == 1){
        cycles -= 1;
        repeat -= 1;
        currCycle = -1;
    }
    
    /*
    * Cool down timer
    * Will get execute after completion of all rounds and repeats
    */
    if (TotalSeconds == 0 && repeat == 0 && currCycle == -1){ 
        applyClass('cooldown');
        $j('#CurrentTimer').html("Cool Down");
        TotalSeconds =  setTimerArray[4];
        sound_colldown    = 1;
        currCycle    = -2;
        setTimer = -1;
    }
    
    /*
    * Check whether to go for next repeat or not
    * If not the run Cool Down timer if set
    */
    if (TotalSeconds == 0 && setTimer >= 3){
        cycles -= 1;
        if (cycles > 0){
            //sound_next_round = 1; 
            setTimer = 0;
            currCycle    = 1;
        }else{
            if(workoutType == 2){// Advanced
                repeat -= 1;
                if (repeat > 0){
                    setTimer = 0;
                    cycles = parseInt($j('#rounds').html());
                    currCycle    = 1; 
                }else{
                    repeat = 0;
                    currCycle = -1
                }
            }else{ //Basic
                repeat = 0;
                currCycle = -1 
            }
        }                
    }
    
    /*
    * Stop timer execution
    */
    if (TotalSeconds == 0 && currCycle == -2){  
        stopTimer();
        return true;
    }
    
    if (TotalSeconds == 0 && setTimerArray[1] == 0 && setTimerArray[2] == 0 && setTimerArray[3] == 0){
        stopTimer();
        return true;
    }
    
    /*
    * Callback function after every second
    */
    timeoutID = window.setTimeout("Tick()", 1000);
    
    /*
    * Update timer
    */
    UpdateTimer();
}

/*
* Apply CSS class according to the current timer.
*/
function applyClass(timerName){
    var classname = 'curr-timer-left color-yellow';
    switch(timerName){
        case 'warmup':
            classname = 'curr-timer-left color-yellow';
        break;
        case 'hit':
            classname = 'curr-timer-left color-green';
        break;
        case 'lit':
            classname = 'curr-timer-left color-orange';
        break;
        case 'rest':
            classname = 'curr-timer-left color-red';
        break;
        case 'cooldown':
            classname = 'curr-timer-left color-skyblue';
        break;
        case 'restbtwrepeat':
            classname = 'curr-timer-left color-red';
        break;
    }
    $j('#curr-color').removeClass().addClass(classname);
}

/*
* Pause timer execution
*/
function pauseTimer(){ 
    $j('#divResume').css("display","block");
    $j('#divPause').css("display","none");
    if (currRunningTimer == 1)  
        clearTimeout(timeoutID); 
    else
        clearTimeout(timeoutID321); 
}

/*
* Resume timer execution
*/
function resumeTimer(){
    $j('#divResume').css("display","none");
    $j('#divPause').css("display","block");
    
    if (currRunningTimer == 1)  
        timeoutID = window.setTimeout("Tick()", 1000); 
    else
        timeoutID321 = window.setTimeout("execute321()", 1000);
}

/*
* Stop timer execution and reset the timer
*/
function stopTimer(){
    
    clearTimeout(timeoutID);
    loadSettings();
}

/*
* Update the current timer like Total Timer Remaining, Number of Rounds, Number of Repeat.
*/
function UpdateTimer() {
    playSound();
    
    var strTmp  = toMinutes(TotalSeconds).split(":");
    
    if (strTmp[2])
        var strtime = pad(strTmp[0], 2)+":"+pad(strTmp[1], 2)+":"+pad(strTmp[2], 2);
    else
        var strtime = pad(strTmp[0], 2)+":"+pad(strTmp[1], 2);
        
    Timer.innerHTML = strtime;
    $j('#roundsRemaining').html(pad(cycles, 2));
    
    if (workoutType == 2){ // Advanced
        $j('#repeatsRemaining').html(pad(repeat, 2));
    }
    
    if (totTimeRemaining <= 0){
        var tmpRes       = "00:00";
    }else{
        var tmpRes       = toMinutes(totTimeRemaining).split(":"); 
    }
    
    if (tmpRes[0] && tmpRes[1]){
        if (tmpRes[2])
            $j('#totTimeRemaining').html(pad(tmpRes[0], 2)+":"+pad(tmpRes[1], 2)+":"+pad(tmpRes[2], 2)); 
        else
            $j('#totTimeRemaining').html(pad(tmpRes[0], 2)+":"+pad(tmpRes[1], 2)); 
    }
    else
        $j('#totTimeRemaining').html("00:00");
    
}

/*
* Convert minutes to seconds
*/
function toSeconds(str) {
    if (str == ""){
        str = "00:00";
    }
    var pieces = str.split(":");
    var result = Number(pieces[0]) * 60 + Number(pieces[1]);
    return(result.toFixed(3));
}

/*
* Convert seconds to minutes
*/
function toMinutes(secs){
    var hours = Math.floor(secs / (60 * 60));
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
    if (hours)
        return hours+":"+minutes+":"+seconds;
    else
        return minutes+":"+seconds;
}

/*
* Add zero to the left side of number.
*/
function pad(number, length) {
   
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
   
    return str;

} 

function setStartIntervalTimerValue(){
    setValueIntervals = (setValueIntervals > 20) ? (setValueIntervals - 20) : setValueIntervals;
    if (setValueIntervals <= 20) setValueIntervals = "fast";
}

function resetStartIntervalTimerValue(){
    setValueIntervals = 200;
}

/*
* Decrease timer by one unit if user click only once
* otherwise decrease the timer continuosly until user release the minus sign
*/
function decreaseTimer(cntlId){
    var strValue = $j('#'+cntlId).html();
    var time     = strValue.split(":");
    
    if (time[0] == 0 && time[1] == 0){
        return false;
    }
    time[1]     -= 1;
    time[1]      = pad(time[1], 2);
    
    if(time[1] < 0){
        time[0] -= 1;
        time[0]  = pad(time[0], 2);
        time[1]  = 59;
    }
    
    var result   = time[0]+":"+time[1];
    $j('#'+cntlId).html(result);
    
    totalTime();
    
    incTimerID = window.setTimeout("decreaseTimer('"+cntlId+"')", setValueIntervals);
    setStartIntervalTimerValue();
}

/*
* Increase timer by one unit if user click only once
* otherwise increase the timer continuosly until user release the Plus sign
*/
function increaseTimer(cntlId){ 
    var strValue = $j('#'+cntlId).html();
    var time     = strValue.split(":");
    
    if (time[0] == 59 && time[1] == 59){
        return false;
    }
    time[1]     = time[1].replace(/^0+/, '');
    if (time[1] == ""){
        time[1] = 0;
    }
    
    time[1]     = parseInt(time[1]) + 1;       
     
    if(time[1] > 59){
        time[0]     = time[0].replace(/^0+/, '');
        if (time[0] == ""){
            time[0] = 0;
        }
        time[0]  = parseInt(time[0]) + 1;
        time[0]  = pad(time[0], 2);
        time[1]  = pad(0, 2);
    }
    
    var result   = pad(time[0], 2)+":"+pad(time[1], 2);
    $j('#'+cntlId).html(result);
    
    totalTime();
    
    incTimerID = window.setTimeout("increaseTimer('"+cntlId+"')", setValueIntervals);
    setStartIntervalTimerValue();
}

/*
* Decrease number of rounds by one unit if user click only once
* otherwise decrease if continuosly until user release the Minus sign
*/
function decreaseRounds(cntlId){
    var rounds = $j('#'+cntlId).html();
    
    if (rounds == 1){
        return false;
    }
    
    rounds    -= 1;
    rounds     = pad(rounds, 2);
    $j('#'+cntlId).html(rounds);
    
    totalTime();
    incTimerID = window.setTimeout("decreaseRounds('"+cntlId+"')", setValueIntervals);
    setStartIntervalTimerValue();
}

/*
* Increase number of rounds by one unit if user click only once
* otherwise increase if continuosly until user release the Plus sign
*/
function increaseRounds(cntlId){
    var rounds = $j('#'+cntlId).html();
    
    if (rounds == 100){
        return false;
    }
   
    rounds     = rounds.replace(/^0+/, '');
    
    if (rounds == ""){
        rounds = 0;
    }
    rounds     = parseInt(rounds);
    rounds    += 1;
    rounds     = pad(rounds, 2);
    $j('#'+cntlId).html(rounds);
    
    totalTime();
    incTimerID = window.setTimeout("increaseRounds('"+cntlId+"')", setValueIntervals);
    setStartIntervalTimerValue();
}

/*
* Calculate the total time
*/
function totalTime(){
    var valWarmup   = toSeconds($j('#warmup').html());
    var valHit      = toSeconds($j('#hit').html());
    var valLit      = toSeconds($j('#lit').html());
    var valRest     = toSeconds($j('#rest').html());
    valRounds       = $j('#rounds').html()
    valRounds       = parseInt(valRounds.replace(/^0+/, ''));
    var valCoolDown = toSeconds($j('#cooldown').html());
    var valrestRpt  = toSeconds($j('#restbtwrepeat').html());  
    var valRepeats  = $j('#repeats').html();
   
   if (workoutType == 2){ // Advanced
        var totaltmp = 0;
        var total = 0;
         
        if (valRepeats > 1){
            for(var n=1; n <= valRounds; n++){
                if ( n <= (parseInt(valRounds) - 1) ){
                    totaltmp += parseInt(valHit) + parseInt(valLit) + parseInt(valRest);
                }
                else{
                    totaltmp += parseInt(valHit) + parseInt(valLit) + parseInt(valrestRpt);
                }
            }
            total = ((totaltmp * valRepeats ) + parseInt(valWarmup) + parseInt(valCoolDown)) - parseInt(valrestRpt);
        }else{
            for(var n=1; n <= valRounds; n++){
                if ( n <= (parseInt(valRounds) - 1) ){
                    totaltmp += parseInt(valHit) + parseInt(valLit) + parseInt(valRest);
                }
                else{
                    totaltmp += parseInt(valHit) + parseInt(valLit) + parseInt(valCoolDown);
                }
            }
            total = (totaltmp * valRepeats ) + parseInt(valWarmup);
        }
   }else{ // Basic
        var total        = ( parseInt(valWarmup) + ( ( parseInt(valHit) + parseInt(valLit) + parseInt(valRest) ) * valRounds ) ) + parseInt(valCoolDown);
        if ($j("#chkOmitInterval").is(':checked')){
            total -= parseInt(valRest);
       }
   }
   
   
   totTimeRemaining = total;
   var result       = toMinutes(total);
   var tmptime      = result.split(":");
   
   if (tmptime[2])
    $j('#totalTime').html(pad(tmptime[0], 2)+":"+pad(tmptime[1], 2)+":"+pad(tmptime[2], 2));
   else
    $j('#totalTime').html(pad(tmptime[0], 2)+":"+pad(tmptime[1], 2));
               
   $j('#roundsRemaining').html(pad(valRounds, 2));
   if (workoutType == 2){ // Advanced
        $j('#repeatsRemaining').html(pad(valRepeats, 2));
   }
   
   if (tmptime[2])
    $j('#totTimeRemaining').html(pad(tmptime[0], 2)+":"+pad(tmptime[1], 2)+":"+pad(tmptime[2], 2));
   else
    $j('#totTimeRemaining').html(pad(tmptime[0], 2)+":"+pad(tmptime[1], 2));
}

/*
* Play sound
*/
function playSound(){
	$j( ".timersound" ).attr("volume", (volume/100));
    if (sound_warm_up == 1){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/warmup.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        
        if (setTimerArray[1] == 0 && setTimerArray[2] == 0 && setTimerArray[3] == 0)
            sound_warm_up = 0;
        else
            sound_warm_up = 2;
            
    }else if (sound_warm_up == 2  && TotalSeconds == 3){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/3-2-1.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        sound_warm_up = 0;
    }
    
    if (sound_hit == 1){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/Bell.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        setTimeout('$j("#tt_sound").html(\'<audio class="timersound" controls autoplay><source src="sounds/HiIntensity.mp3" type="audio/mp3" volume="'+volume+'"></audio>\');',2000);
        
        if (cycles >= 1 && setTimerArray[1] > 0 && setTimerArray[2] <= 0)
            sound_hit = 2;
        else if (cycles >= 1 && setTimerArray[2] > 0)
            sound_hit = 2;
        else if (cycles >= 1 && setTimerArray[2] <= 0 && setTimerArray[1] > 0)
            sound_hit = 2;
        else
            sound_hit = 0;
    }else if (sound_hit == 2  && TotalSeconds == 3){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/3-2-1.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        sound_hit = 0;
    }
    
     if (sound_lit == 1){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/Bell.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        setTimeout('$j("#tt_sound").html(\'<audio class="timersound" controls autoplay><source src="sounds/LoIntensity.mp3" type="audio/mp3" volume="'+volume+'"></audio>\');',2000);
        
        if (cycles > 1 && setTimerArray[1] > 0 && setTimerArray[3] == 0)
             sound_lit = 2;
        else if (cycles > 1 && setTimerArray[1] <= 0 && setTimerArray[2] > 0 && setTimerArray[3] <= 0)
            sound_lit = 2;
        else if (cycles >= 1 && setTimerArray[2] > 0)
            sound_lit = 2;  
        else
            sound_lit = 0;      
    }else if (sound_lit == 2  && TotalSeconds == 3){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/3-2-1.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        sound_lit = 0;
    }
     
     if (sound_rest == 1){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/Rest.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        
        if (cycles > 1 && (setTimerArray[1] > 0 || setTimerArray[2] > 0))
            sound_rest = 2;
        else
            sound_rest = 0;
    }else if (sound_rest == 2  && TotalSeconds == 5){  
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/NextRound.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        sound_rest = 3;
    }else if (sound_rest == 3  && TotalSeconds == 3){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/3-2-1.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        sound_rest = 0;
    }
    
    if (sound_rest_bt_repeats == 1){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/Rest.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        
        if (repeat > 1 && (setTimerArray[1] > 0 || setTimerArray[2] > 0))
            sound_rest_bt_repeats = 2;
        else
            sound_rest_bt_repeats = 0;
    }else if (sound_rest_bt_repeats == 2  && TotalSeconds == 5){  
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/NextRound.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        sound_rest_bt_repeats = 3;
    }else if (sound_rest_bt_repeats == 3  && TotalSeconds == 3){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/3-2-1.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        sound_rest_bt_repeats = 0;
    }
    
    if (sound_colldown == 1){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/CoolDown.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        sound_colldown = 0;
    }
    if (sound_next_round == 1){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/NextRound.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        setTimeout('$j("#tt_sound").html(\'<audio class="timersound" controls autoplay><source src="sounds/3-2-1.mp3" type="audio/mp3" volume="'+volume+'"></audio>\');',3000);
        sound_next_round = 0;
    }
    
    if (sound_3_2_1 == 1){
        $j("#tt_sound").html('<audio class="timersound" controls autoplay><source src="sounds/3-2-1.mp3" type="audio/mp3" volume="'+volume+'"></audio>');
        sound_3_2_1 = 0;
    }
}

function continuousEvent(cntlId, functionType){
    switch(functionType){
        case "incTime":     
            increaseTimer(cntlId);
        break;
        case "decTime":     
            decreaseTimer(cntlId);
        break;
        case "incRound":     
            increaseRounds(cntlId);
        break;
        case "decRound":     
            decreaseRounds(cntlId);
        break;
    }
}
function stopMouseEvent(){
    clearTimeout(incTimerID);
    resetStartIntervalTimerValue();
}

$j(document).ready(function() {
  //loadSettings();
});
