var $j = jQuery.noConflict();
/*
* For pagination
*/
var pageNo = 1;
/*
* For sorting.
* This is the default ordering setting
*/
var ordering = "DESC#id";

$j(document).ready(function(){                                                                
    /*
    * After clicking on Save button, this evnet get gerenerate
    */
    $j("#btndialogbox").click(function(){
        if ($j("#totalTime").html() == "00:00"){
            showMessages("ERROR#You cannot save zero total time");
        }else {
            showMessages("#");
            $j("#saveDialogbox, #lightbox-panel").fadeIn(300);
        }
    });
    /*
    * After clicking on Cancel button, this evnet get gerenerate
    */
    $j("#close-panel").click(function(){
        $j("#txtWorkoutTimer").val('');
        $j('#result').html('&nbsp;');
        $j("#saveDialogbox, #lightbox-panel").fadeOut(300);
    });
    /*
    * After pressing Enter Key on workout name text box, this evnet get gerenerate
    */
    $j("#txtWorkoutTimer").keyup(function(event) {
        if (event.which == 13) {
            var e = $j.Event("click");
          // trigger an artificial click event
          $j("#btnSave").trigger( e );
       }
    });
    
    /*
    * After clicking on OK button on Save My Workout Pop up window, this evnet get gerenerate
    * If user not provide the workout name then, error message get display on the screen
    * If user enter the workout name which is already exists in the database then, error message get display on the screen
    * If workout saved properly into the database then, popup automatically get closed.
    */
    $j('#btnSave').click(function(){    
         var jWorkout    = $j("#txtWorkoutTimer").val();
         var jWarmUp    = $j("#warmup").html();
         var jHit       = $j("#hit").html();
         var jLit       = $j("#lit").html();
         var jRest      = $j("#rest").html();
         var jRounds    = $j("#rounds").html();
         var jCooldown  = $j("#cooldown").html();
         var jTotalTime = $j("#totalTime").html();
         var jRbT       = $j("#restbtwrepeat").html();
         var jRepeats   = $j("#repeats").html();
         var jVolume    = $j("#volume").html();
         if ($j("#chkOmitInterval").is(':checked'))
            var jOmitRestT = 1;
         else
            var jOmitRestT = 0;
            
         if (jWorkout == ''){
            $j('#result').removeClass().addClass("centercntl ERROR");
            $j('#result').html("<div id='msgDiv' style='display:none;'>You can't leave workout name empty</div>");
            $j("#msgDiv").fadeIn('slow');
         }else{        
            $j.post(DIRECTORY+'/save_timer.php', {workoutnme : jWorkout, workouttype : workoutType, warmup : jWarmUp, hit : jHit, lit : jLit, rest : jRest, round : jRounds, cooldown : jCooldown, tottime : jTotalTime, repeatbT : jRbT, repeat : jRepeats, volume : jVolume, omitLastRest : jOmitRestT}, function(data) {
                var res = data.split("@~@");
                $j("#txtWorkoutTimer").val(''); 
                $j('#result').removeClass().addClass("centercntl "+res[0]);
                $j('#result').html("<div id='msgDiv' style='display:none;'>"+res[1]+"</div>");
                $j("#msgDiv").fadeIn('slow');
                showMessages(res[0]+"#"+res[1]);
                if (res[0] == "SUCCESS"){
                    var e = $j.Event("click");
                    $j("#close-panel").trigger( e );
                }
            });
         }
    });
    
    /*
    * The use of this event is to take user back to the timer page from My Workout page,
    */
    $j('#btnBack').click(function(){
        pageNo = 1;
        ordering = "DESC#id";
        $j("#listingButtons").fadeOut('slow');
        $j("#listingDiv").fadeOut('slow',function(){
               $j("#timerDIV").fadeIn('slow');  
               $j("#timerButtons").fadeIn('slow');  
            });
    });
    /*
    * This event is use to show the saved workout timers listing.
    * This is an Ajax call
    */
    $j('#btnListing').click(function(){
        showMessages("#");
        nowLoading('block');  
        $j.post(DIRECTORY+'/timer.php',{listing : 1, page : pageNo, orderby : ordering}, function(data){
            $('nowLoading').style.display = 'none';
            $j("#listingDiv").html(data);
            $j("#timerButtons").fadeOut('slow');
            $j("#timerDIV").fadeOut('slow',function(){
               $j("#listingDiv").fadeIn('slow');  
               $j("#listingButtons").fadeIn('slow');  
            });
        });
    });
});
/*
* This function is use to load the pagination on listing page.
*/
function loadPagination(cPage){
    pageNo = cPage;
    var e = $j.Event("click");
    $j("#btnListing").trigger( e );
}
/*
* This function is use for sorting purpose.
* This function automatically trigger to the listing event
* To do this I've create an artificial click event for listing.
*/
function sortingWorkouts(orderby){
    ordering = orderby;
    var e = $j.Event("click");
    $j("#btnListing").trigger( e );
}

/*
* Function show messages
*/
function showMessages(message){
    var msg = message.split("#");
    $j('#timerMsg').removeClass().addClass("centercntl "+msg[0]);
    $j('#timerMsg').html("<div id='TimermsgDiv' style='display:none;'>"+msg[1]+"</div>");
    $j("#TimermsgDiv").fadeIn('slow');
    $j('#listingMsg').html("&nbsp;");
}

/*
* This event is use to delete the saved workout timer.
* This is an Ajax call
*/
function deleteWorkout(id){
    nowLoading('block');  
    $j.post(DIRECTORY+'/timer.php',{deleteWorkout : id, page : 1, orderby : ordering}, function(data){
        $('nowLoading').style.display = 'none';
        $j("#listingDiv").html(data);
        $j("#timerButtons").fadeOut('slow');
        $j("#timerDIV").fadeOut('slow',function(){
           $j("#listingDiv").fadeIn('slow');  
           $j("#listingButtons").fadeIn('slow');  
           
           if (data == 1){
                $j('#listingMsg').removeClass().addClass("centercntl SUCCESS");
                $j('#listingMsg').html("Workout Deleted Successfully!");
           }else{
                $j('#listingMsg').removeClass().addClass("centercntl ERROR");
                $j('#listingMsg').html("Error in Workout Deletion!");
           }
        });
    });
}