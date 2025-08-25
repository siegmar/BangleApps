/*

23.8.2025   zu Testzwecken wird jeder Minutenwert gespeichert
            später nur noch erhöhte Werte







5.8.2025  
Datenformat 

timestamp , GMZ , CR
1111111111,99,13,10
1111111171,15,13,10

Datenbedarf 
pro Minute etwa      19  Bytes 
pro Stunde etwa   1 140  Bytes 
pro Tag    etwa  27 360  Bytes
pro Monat  etwa 820 800  Bytes


Infos

Bangle.buzz(100);



 var zeit = new Date();
time = zeit.getTime()/1000;  // SEkunden seit 1970 
console.log ( "Timestamp " , time , " ms");



E.showAlert("Hello").then(function() {
  print("Ok pressed");
});


// or


E.showAlert("These are\nLots of\nLines","Alpha Stick suchen").then(function() {
  print("Ok pressed");
});



DailyLogger.log(15);




******************************************************************************/

const DATA_LOGGING = false;    // keine Daten loggen 

//const DATA_LOGGING = true;    // keine Daten loggen 


const BLACK  =  '#000000' ;
const GREEN  =  '#00ff00' ;
const YELLOW =  '#ffff00' ;
const RED    =  '#ff0000' ;
const BLUE   =  '#0000ff' ; 
const WHITE  =  '#ffffff' ; 


const BIT_0 = 0;
const BIT_1 = 1;
const BIT_2 = 2;
const BIT_3 = 3;
const BIT_4 = 4;
const BIT_5 = 5;
const BIT_6 = 6;
const BIT_7 = 7;
const BIT_8 = 8;
const BIT_9 = 9;
const BIT_A = 10;
const BIT_B = 11;
const BIT_C = 12;
const BIT_D = 13;
const BIT_E = 14;
const BIT_F = 15;


const BATT_SPG_MESSUNG_HV       = BIT_F ;   // zeigt an, das HV Batteriespannung vorliegt
const BATT_SPG_MESSUNG_REF_2_5  = BIT_E ;   // zeigt an, das mit 2.5V Referenzspannung gemessen wurde


const BATT_SPANNUNG_FLAG        = BIT_2 ;
const TEMPERATUR_FLAG           = BIT_3 ;
const SYSTEM_FEHLER_FLAG        = BIT_4 ;
const GMZ_MINUTE_FLAG           = BIT_5 ;
const GMZ_LOW_RATE_FLAG         = BIT_6 ;
const GMZ_HIGH_RATE_FLAG        = BIT_7 ;



//--- Fehlercodes die vom PAN1740 übertragen werden ---

const FIRST_START                =  BIT_0 ;
const BT_FEHLER                  =  BIT_1 ;
const HV_FEHLER_KALTSTART        =  BIT_2 ;
const HV_FEHLER                  =  BIT_3 ;
const HV_ABGESCHALTET            =  BIT_4 ;

/*
const LF_FEHLER                       BIT_5           // LF Quarz Fehler
const INTERNER_RESET_FLAG_1           BIT_6
const INTERNER_RESET_FLAG_2           BIT_7
const EXTERNER_RESET_FLAG             BIT_8
const PAN1740_RESET_FLAG              BIT_9
*/

const SPI_FLASH_ULTRA_DEEP_POWER_DOWN    = BIT_7 ;
const I2C_INIT_MSP430                    = BIT_8 ;
const MESSDATEN_ECHTZEIT_LESEN           = BIT_9 ;
const BATTERIE_SPANNUNG_LESEN            = BIT_A ;
const I2C_INIT_SI7051                    = BIT_B ;
const TEMPERATUR_SENSOR_ABFRAGEN         = BIT_C ;
const SYSTEMFEHLER_LESEN                 = BIT_D ;
const BATTERIE_SPANNUNG_MESSUNG          = BIT_E ;



const BLE_SCAN_START                   = 2 ;
const DATEN_GEFUNDEN                   = 4 ;
const ALPHA_STICK_GEFUNDEN             = 6 ;
const ALPHA_STICK_NICHT_GEFUNDEN       = 8 ;
const ZEHN_SEKUNDEN_COUNTDOWN         = 10 ;
const WARTEN_DATEN_UEBERTRAGUNG_ENDE  = 12 ;
const SYSTEM_AUSSCHALTEN              = 14 ;
const BLE_SCAN_PENDING                = 16 ;




const GMZ_Impulse_pro_Messzeit_neu    = 1 ;
const GMZ_Impulse_pro_Minute_neu      = 2 ;  
const RSSI_wert_neu                   = 3 ;
const temperatur_neu                  = 4 ;
const hv_timer_neu                    = 5 ;
const hv_puls_neu                     = 6 ;
const batt_neu                        = 7 ;
const hv_batt_neu                     = 8 ;
const mess_system_status_neu          = 9 ;
const hv_status_neu                   =10 ;
const wlan_status_neu                 =11 ;



const GREEN_GRENZWERT  = 30 ;
const YELLOW_GRENZWERT = 50 ;

    
    

/*
//-------------- betriebsmodus ------------
 const GMZ_GROSS       = 0 ;
 const UHRZEIT_GROSS   = 1 ;
 const SERVICE         = 2 ; 
 const ENDE            = 3 ;
 //-----------------------------------------
*/

//-------------- betriebsmodus ------------
 const GMZ_GROSS       = 0 ;
 const SERVICE         = 1 ;

//const UHRZEIT_GROSS   = 1 ;
 
// const ENDE            = 3 ;
 //-----------------------------------------

 const Max_Anzahl_Scan_Versuche = 3;


//************************** Globale Variable *******************************

/*
typedef struct{
  volatile bool     messwerte_neu[15];                   // wenn Bit true, dann liegt ein neuer Messwert vor 
  volatile bool     GMZ_Impulse_pro_Minute_neu_flag;
  volatile bool     GMZ_Impulse_pro_Minute_darstellen;   // wenn true, dann muß der Wert dagestellt werden
  volatile uint32_t timestamp;
  volatile uint16_t GMZ_Impulse_pro_Messzeit;
  volatile uint16_t GMZ_Impulse_pro_Minute;  
  volatile int16_t  RSSI_wert;
  volatile float    temperatur=200;                     // unmöglicher Messwert, damit erkannt werden kann, ob ein richtiger
  volatile uint8_t  hv_timer;                           // Messwert schon vorhanden ist.
  volatile uint8_t  hv_puls;
  volatile float    batt;
  volatile float    hv_batt;
  volatile uint16_t mess_system_status;
  volatile bool     hv_status;
  String            Info_string;
  bool              wlan_status; 
}MESS_Data;

*/


//*************** Globale Variable ****************


 var GMZ_Touch_x1 =   0;
 var GMZ_Touch_y1 =  28;
 var GMZ_Touch_x2 = 176;
 var GMZ_Touch_y2 = 100;



 var betriebsmodus = GMZ_GROSS;

 var Uhrzeit_Timer_1 ;
 var Scan_Timer_1 ;
 var Scanning = false ;
 var Scan_Versuche = 0;


 var scanTimeout = null;
 var foundSensor = false;

 var Alpha_Stick_Kontakt_vorhanden = 0;


 var SCAN_INTERVAL = 3000;

 var telegramm_zaehler = 0;
 var alpha_stick_nicht_gefunden = 0;                // zählt wie oft Alpha Stick nicht gefunden wurde

 var Uint32mess_data_timestamp ;
 
// Uint8wert=0 ;

 var Alpha_Stick_RSSI = 0;


 let batterie_spannung = 0;                            // Batteriespannung Leerlauf
 let batterie_spannung_grenzwert_1 = 3.0;            // Batteriespannung gelb wenn zwischen 2.7 - 3.0 V über 3V grün
 let batterie_spannung_grenzwert_2 = 2.7;            // Batteriespannung < 2.7 rot 

 let hv_batterie_spannung =0;                         // Batteriespannung unter Volllast
 let hv_batterie_spannung_grenzwert_1 = 2.7;         // Batteriespannung gelb wenn zwischen 2.4 - 3.0 V über 3V grün
 let hv_batterie_spannung_grenzwert_2 = 2.4;         // Batteriespannung < 2.4 rot 

 let temperatur = 0;
  
 let temperatur_grenzwert_1 = 0;                     // unter 0 Grad Celsius, ist die Temperaturanzeige blau darüber gelb
 let temperatur_grenzwert_2 = 40;                    // ab 40 Grad Celsius 

 let hv_entlade_zeit   = 0;
 let hv_impuls_zaehler = 0;


 let GMZ_Impulse_pro_Minute=0;              
 let GMZ_Impulse_pro_Minute_merker=0;
 let GMZ_Impulse_pro_Minute_MAX_Wert=0;
 let GMZ_Impulse_pro_Minute_MIN_Wert=0xFFFF;

 let GMZ_Impulse_pro_Minute_Merker = 0xFFFF;    //  später als lokale statische Variable

 let GMZ_MINUTE_FLAG_merker = 0;

 let anzahl_advertising_telegramme=0;               // zählt die korrekten Advertising 
 let advertising_zaehler=0;                         // zählt die Advertising Telegramme


let mess_data_GMZ_Impulse_pro_Minute_neu_flag;
                                                                                                
let GMZ_Impulse_pro_Minute_neu_flag;

let GMZ_Minuten_zaehler=0;

//************************************************





//*********************************** Programme *****************************


//************************* DATA LOGGING *************************************

// stellt alle Datein auf Terminal da 

function datei_liste ()
{
 

// Files ending in '.js'
require("Storage").list(/\.js$/);
// All Storage Files
require("Storage").list(undefined, {sf:true});
// All normal files (e.g. created with Storage.write)
require("Storage").list(undefined, {sf:false});

  try {
     
         var stats = require("Storage").list();
       console.log("Storage Statistik:", JSON.stringify(stats, null, 2));
    } catch (e) {
        console.log("Fehler beim Holen der Statistik:", e);
    }
}

//-------

// Tägliche Log-Dateien - korrigiert
var DailyLogger = {
    getFilePrefix: function() {
        var now = new Date();
        var year = now.getFullYear();
        var month = (now.getMonth() + 1).toString().padStart(2, '0');
        var day = now.getDate().toString().padStart(2, '0');
        return "RADIATION_" + year + "-" + month + "-" + day; // z.B. "RAD_2024-01-15"
    },
    
    getFileName: function() {
        return this.getFilePrefix() + ".csv";
    },
    
    // Einfache Zeitformatierung für Bangle.js 2
    formatTime: function() {
        var now = new Date();
        var hours = now.getHours().toString().padStart(2, '0');
        var minutes = now.getMinutes().toString().padStart(2, '0');
        var seconds = now.getSeconds().toString().padStart(2, '0');
        return hours + ":" + minutes + ":" + seconds;
    },
    
    //log: function(cpm, usv) {
    log: function(cpm) {   
        var filename = this.getFileName();
        var timestamp = Math.floor(Date.now() / 1000);
        var timeStr = this.formatTime(); // Verwende eigene Funktion
        //var csvLine = timestamp + "," + timeStr + "," + cpm + "," + usv + "\n";
        //var csvLine = timestamp + "," + timeStr + "," + cpm + "," + "\n";
        var csvLine = timeStr + "," + cpm  + "\n";
      
      
        try {
            // Prüfen ob Datei neu ist (heutiger Header)
            if (!this.fileExists(filename)) {
                //var header = "timestamp,time,cpm,usv\n";
                //var header = "timestamp,time,cpm\n";
                var header = "time,cpm\n";
                require("Storage").write(filename, header + csvLine);
            } else {
                // Einfach anhängen
                var existing = require("Storage").read(filename) || "";
                require("Storage").write(filename, existing + csvLine);
            }
            
            console.log("Geloggt in " + filename + ": " + csvLine.trim());
            return true;
            
        } catch (e) {
            console.log("Log Fehler:", e);
            return false;
        }
    },
    
    fileExists: function(filename) {
        try {
            var list = require("Storage").list();
            return list.indexOf(filename) !== -1;
        } catch (e) {
            return false;
        }
    },
    
    // Alle heutigen Logs lesen
    readToday: function() {
        try {
            return require("Storage").read(this.getFileName()) || "";
        } catch (e) {
            return "";
        }
    },
    
    // Liste aller Log-Dateien
    listLogFiles: function() {
        try {
            var allFiles = require("Storage").list();
            var logFiles = [];
            
            for (var i = 0; i < allFiles.length; i++) {
                if (allFiles[i].startsWith("RADIATION_") && allFiles[i].endsWith(".csv")) {
                    logFiles.push(allFiles[i]);
                }
            }
            
            return logFiles.sort(); // Sortiert nach Datum
        } catch (e) {
            return [];
        }
    }
};

// Hilfsfunktion für padStart (falls nicht verfügbar)
if (!String.prototype.padStart) {
    String.prototype.padStart = function(length, padString) {
        var str = String(this);
        while (str.length < length) {
            str = padString + str;
        }
        return str;
    };
}


// Benutzung:
// DailyLogger.log(150, 0.750); // Geht automatisch in heutige Datei
 
//DailyLogger.log(15); // Geht automatisch in heutige Datei


//datei_liste ();
// Benutzung:

//DailyLogger.log(150, 0.750); // Geht automatisch in heutige Datei
// DailyLogger.log(16); // Geht automatisch in heutige Datei

// Alle Log-Dateien anzeigen:
// console.log("\nVerfügbare Log-Dateien:", DailyLogger.listLogFiles());


//console.log("\nVerfügbare Log-Dateien:", DailyLogger.readToday());


/******************** Datein löschen und Dateiliste anzeigen ***************

require("Storage").erase("RADIATION_2025-08-23.csv");
require("Storage").erase("rad_2025-08-22.csv");

datei_liste ();

**************************************************************************/







//****************************************************************************
function isIDEConnected() {
    // Prüfe ob Debug-Verbindung aktiv
    try {
        // Wenn console.log sofort ausgeführt wird, ist IDE verbunden
        return typeof Bluetooth !== 'undefined' && Bluetooth.isConnected();
    } catch (e) {
        return false;
    }
}


//--------

function test () 
{
  
  Bangle.buzz(100);
 // setInterval(test, ());
  
}



function uhrzeit_holen() 
{
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    
    // Manuelles Padding
    var hours = (h < 10 ? "0" : "") + h;
    var minutes = (m < 10 ? "0" : "") + m;
    var seconds = (s < 10 ? "0" : "") + s;
    
  //  return hours + ":" + minutes + ":" + seconds;
      
    return hours + ":" + minutes ;
}

//-------------------------------------------------------

function uhrzeit_darstellen( x , y , fontSize)
{
  
    uhrzeit = uhrzeit_holen();
  
    var zeit = new Date();
    var s = zeit.getSeconds();

    var neuer_intervall;
    
    neuer_intervall = (60 - s + 1) * 1000 ;   // in ms
  
  
 //   changeInterval(Uhrzeit_Timer_1, 60 - zeit.getSeconds()); // now runs every 1.5 seconds

  
      changeInterval(Uhrzeit_Timer_1, neuer_intervall ); // now runs every 10 seconds

  
  
//    var Uhrzeit_Timer_1 = setInterval(function() {uhrzeit_darstellen( 10 , 110 , 60);}, 10000); // Intervall)
    
    
//    Graphics.clearRect(0, y, 176, 176);
   
    y=y + 10;
  
    g.clearRect(0, y, 176, 176);     // löscht Bereich  der Uhrzeit  
                                     // Optimierung ? weiße alte Uhrzeit überschreiben ? 
  
    g.setFont("Vector", fontSize);
    
    g.setColor(BLACK);

    g.drawString( uhrzeit , x, y);
  
//      g.flip();
  
    console.log("---> Uhrzeit darstellen neuer_intervall", neuer_intervall);
}

//---------------------- START Anzeige ------------------
// vati

function menue_anzeigen(text,color)
{
  
  g.clearRect(GMZ_Touch_x1,GMZ_Touch_y1,GMZ_Touch_x2,GMZ_Touch_y2); 
/* 
  g.setColor(color);
  g.setFont("Vector", 60);
  g.drawString(text, 5, 40);
  
*/       
  drawTextWithThickOutline(text, 5, 40 , 60 ,color);  
 
  g.setColor(WHITE);
  g.setFont("Vector", 25);
  g.drawString("cpm", 125, 95);    
      
  
  
}




//-------------------------------------------------------
function drawTextWithThickOutline(text, x, y, fontSize, color) 
{
    g.setFont("Vector", fontSize);
    
    // Schwarzer dicker Rahmen
    g.setColor(BLACK);
    for (var i = -2; i <= 2; i++) {
        for (var j = -2; j <= 2; j++) {
            if (Math.abs(i) + Math.abs(j) <= 2) { // Runde Ecken
                g.drawString(text, x + i, y + j);
            }
        }
    }
    
    // Heller  Text oben drauf
    g.setColor(color);       // GRÜN
    g.drawString(text, x, y);
  
}

//----------------------- gmz_anzeige -----------------------------------------

/*
betriebsmodus = GMZ_GROSS ;
          menue_anzeigen("STOP",RED);
          
          clearTimeout( Scan_Timer_1 );
          Scanning = false ;  
*/





function gmz_anzeige ( wert)
{
   
   Bangle.loadWidgets();
   Bangle.drawWidgets();
  
  var displayValue = wert ;
  
  
  console.log("\n  displayValue :",  displayValue );
  
  var font_groesse = 90 ;
  var x ;
  var y;
  var color; 

  
//vati hier geht es weiter  
  
// nur bei Messwertänderung zeichnen  
//  if (GMZ_Impulse_pro_Minute_Merker !== GMZ_Impulse_pro_Minute)  // hat sich der Wert geändert ?
  {
  
    GMZ_Impulse_pro_Minute_Merker = GMZ_Impulse_pro_Minute ; 
    
    
    g.clearRect(GMZ_Touch_x1,GMZ_Touch_y1,GMZ_Touch_x2,GMZ_Touch_y2);     // löscht Bereich  der Uhrzeit  
                                      // Optimierung ? weiße alte Uhrzeit überschreiben ? 

  //GMZ_Touch_x1,GMZ_Touch_y1,GMZ_Touch_x2,GMZ_Touch_y2

//    g.drawRect(GMZ_Touch_x1,GMZ_Touch_y1,GMZ_Touch_x2,GMZ_Touch_y2);
  
  //drawTextWithThickOutline("999", 10, 100, 80 , YELLOW);  
  
  
  //var displayValue = Math.max(0, Math.min(999, wert));  // ???
   
//  wert = 1999;
  
  
  
// --------- Farbe bestimmen ----------
   
    
//-------------------------------------------    
   
    
    if (displayValue <= GREEN_GRENZWERT) 
    {
        color = GREEN ;
    } 
    else if (displayValue <= YELLOW_GRENZWERT ) 
    {
        color = YELLOW ;
    } 
    else 
    {
        color = RED ;
    }
    
    g.setColor(color);
    
//-------------------------------------  
  
  if (displayValue > 999)
  {
     font_groesse = 60 ;
    
  }
  
  
    // Sehr große Schrift - nutze fast die gesamte Displayhöhe
    
  g.setFont("Vector", font_groesse);
    
    
    if ( wert > 0)
    {
       valueStr = displayValue.toString();
        
      stringWidth = g.stringWidth(valueStr);
    
    // Perfekt zentriert
     x = (176 - stringWidth) / 2;
    //var y = (176 - 80) / 2 + 40; // Vertikal zentriert
   
//    var y = (176 - 80) / 2 ; // Vertikal zentriert
  
  //   y = ((176 - font_groesse) / 2) -font_groesse/2  + 30; // Vertikal zentriert
      
      y= 25;
      
      if ( font_groesse === 60 )
      {
        
        y= 40;
      }
  //  
      
      drawTextWithThickOutline(wert, x, y,  font_groesse ,color);  
      
    }
    else   // wert = 0
    {
      
     if ( Scanning === false )       // Scanning abgebrochen  
      
     {
       
/*       
       
       color = RED; // Rot 
       g.setColor(color);
       valueStr = "STOP";
       stringWidth = g.stringWidth(valueStr);
      // x = (176 - stringWidth) / 2;
       x=5;
     // y = ((176 - font_groesse) / 2) -font_groesse/2 -2 ; // Vertikal zentriert
      
      y=40 ;
      font_groesse = 60 ;
vati       
*/       
       menue_anzeigen("STOP",RED);
       
    
     }
     else
     {
      
 /*
       color = GREEN; // Rot 
       g.setColor(color);
       valueStr = "SCAN";
       stringWidth = g.stringWidth(valueStr);
      // x = (176 - stringWidth) / 2;
       x=5;
     // y = ((176 - font_groesse) / 2) -font_groesse/2 -2 ; // Vertikal zentriert
      
      y=40 ;
      font_groesse = 60 ;
*/       
       menue_anzeigen("SCAN",RED);
       
     }

        
   // drawTextWithThickOutline(valueStr, x, y,  font_groesse ,color);  
    }     
  

  
//    drawTextWithThickOutline(valueStr, x, y,  font_groesse ,color); 
  
/*
  
//-------------------------- CPM Anzeige ----------------------  

// cpm Anzeige nur bei normalen Werten    
  
      if (wert > 0 && wert < 100)
      {
         color = BLACK;
         g.setColor(color);
         g.setFont("Vector", 25);
         g.drawString("c", 158+2, 30);
         g.drawString("p", 158+2, 48);
         g.drawString("m", 152+2, 70);
      }
//------------------------------------------------------------- 
*/  
  
//-------------------------- CPM Anzeige ----------------------  
//vati
 
//         g.setColor(color);
  
// !! gleiche Farbe wie Messwert !!
  
  
  
         g.setFont("Vector", 25);
         g.drawString("cpm", 125, 95);
      
  
  
  }  

  
//--------------------------------------------------------------  
   
//   console.log("Alpha_Stick_RSSI : ", Alpha_Stick_RSSI
  
//---------------- RSSI anzeigen -----------  
    if ( Alpha_Stick_RSSI < 0 )
    { 
      color = BLACK; 
      g.setColor(color);
      g.setFont("Vector", 25);
  
      valueStr = Alpha_Stick_RSSI.toString();
      g.drawString(valueStr, 90, 1);
      
//    console.log("Alpha_Stick_RSSI : ", Alpha_Stick_RSSI);
    }
  
//------ Anzahl der Telegramme anzeigen --------  

/*  
    color = BLACK ; 
    g.setColor(color);
    g.setFont("Vector", 25);
    valueStr =  telegramm_zaehler .toString();
    g.drawString(valueStr, 20, 3);
*/  
    
//-------------- Anzahl der Minutenwerte --------   
    color = BLACK ; 
    g.setColor(color);
    g.setFont("Vector", 25);
    valueStr = GMZ_Minuten_zaehler .toString();
    g.drawString(valueStr, 20, 1);
    
//-----------------------------------------------    
  
  
}



//--------------------------------------------------------

function messwert_anzeige() 
{
    
   var valueStr; 
   var x ;
   var y  ;
   var stringWidth;   
  
  
   g.clear();
    
  
   Bangle.loadWidgets();
   Bangle.drawWidgets();
  
  
    console.log("\n----> Alpha_Stick_RSSI :", Alpha_Stick_RSSI);
  
  
//    var displayValue = Math.max(0, Math.min(999, wert));
    
    var displayValue = Math.max(0, Math.min(999, GMZ_Impulse_pro_Minute));
   

  
    // Farbe bestimmen
    var color;
    if (displayValue <= GREEN_GRENZWERT) 
    {
        color = '#00ff00'; // Grün
    } 
    else if (displayValue <=  YELLOW_GRENZWERT) 
    {
        color = '#ffff00'; // Gelb
    } 
    else 
    {
        color = '#ff0000'; // Rot
    }
    
    g.setColor(color);
    
    // Sehr große Schrift - nutze fast die gesamte Displayhöhe
    g.setFont("Vector", 60);
    
    
    if ( GMZ_Impulse_pro_Minute > 0)
    {
       valueStr = displayValue.toString();
        
      stringWidth = g.stringWidth(valueStr);
    
    // Perfekt zentriert
     x = (176 - stringWidth) / 2;
    //var y = (176 - 80) / 2 + 40; // Vertikal zentriert
   
//    var y = (176 - 80) / 2 ; // Vertikal zentriert
  
     y = ((176 - 60) / 2) -30 -2 ; // Vertikal zentriert
      
      
      
    }
    else
    {
      color = '#ff0000'; // Rot 
      g.setColor(color);
      valueStr = "SCAN";
      stringWidth = g.stringWidth(valueStr);
      x = (176 - stringWidth) / 2;
      
      y = ((176 - 60) / 2) -30 -2 ; // Vertikal zentriert
    }     
  
    g.drawString(valueStr, x, y);
  
  
    
//------------- RSSI anzeigen -----------  
    color = BLACK; 
    g.setColor(color);
    g.setFont("Vector", 25);
  
    valueStr = Alpha_Stick_RSSI.toString();
    g.drawString(valueStr, 90, 1);
    
//------------ Temperatur anzeigen -----------  
    color = BLACK; 
    g.setColor(color);
    g.setFont("Vector", 25);
  
    valueStr = temperatur.toString();
    g.drawString(valueStr, 10 , 176-25);

//------------ Batterie Spannung anzeigen -------
   
    color = '#000000'; // Schwarz
    g.setColor(color);
    g.setFont("Vector", 25);
  
    valueStr = batterie_spannung.toString();
    g.drawString(valueStr, 110 , 176-50);

  
//------------ HV Batterie Spannung anzeigen -------
   
    color = BLACK; 
    g.setColor(color);
    g.setFont("Vector", 25);
  
    valueStr = hv_batterie_spannung.toString();
    g.drawString(valueStr, 110 , 176-25);

//--------------- Uhrzeit anzeigen --------------    
    
    valueStr = uhrzeit_holen();
  
    color = BLUE; 
    g.setColor(color);
//    g.setFont("Vector", 30);
      g.setFont("Vector", 25);
    
//  g.drawString(valueStr, 10 , 176-25-5);
  g.drawString(valueStr, 10 , 176-25-25);
//    g.drawString(valueStr, 60 , 5);

//---------- Anzahl der Telegramme anzeigen --------  

  
    color = BLACK; 
    g.setColor(color);
    g.setFont("Vector", 25);
    valueStr =  telegramm_zaehler .toString();
    g.drawString(valueStr, 20, 1);
    
  
  
//---------------HV Impulszaehler anzeigen -------------  
 
    color = '#000000'; // Schwarz
    g.setColor(color);
    g.setFont("Vector", 25);
  
    valueStr = hv_impuls_zaehler.toString();
    g.drawString(valueStr, 50 , 176-50-20 - 3);

  
  
//---------------HV Entladezeit anzeigen -------------  
  
     color = '#000000'; // Schwarz
    g.setColor(color);
    g.setFont("Vector", 25);
  
    valueStr = hv_entlade_zeit .toString();
    g.drawString(valueStr, 10 , 176-50-20 - 3);

// --------- min   max Wert anzeigen ----------------
  
    color = BLACK; 
    g.setColor(color);
    g.setFont("Vector", 25);
  
    valueStr = GMZ_Impulse_pro_Minute_MAX_Wert .toString();
    g.drawString(valueStr, 110 , 176-50-20 - 3);

  
//---------------------------------------------------  
  
  
//------------------ Scanzeit anzeigen ----------------  
 
  
  
/*  
//------------- executionTime -----------  
    color = '#000000'; // Schwarz
    g.setColor(color);
    g.setFont("Vector", 25);
  
    valueStr = executionTime.toString();
    g.drawString(valueStr, 30, 3);
    
    g.drawString("ms", 100, 3); 
  
*/  
  
    color = '#000000'; // Schwarz
    g.setColor(color);
    g.setFont("Vector", 25);
    valueStr = executionTime.toString();
//vati
    g.drawString(valueStr, 10 , 176-50-40 - 6);
  
  

  
//------ Anzahl fehlgeschlagener Scan Versuche ---- 
 
    color = '#FF0000'; // Rot
    g.setColor(color);
    g.setFont("Vector", 25);
  
//    valueStr = hv_impuls_zaehler.toString();
//    g.drawString(valueStr, 110 , 176-50-20 - 3)
//    g.drawString("100", 110 , 176-50-40 - 6);
  
     valueStr =  alpha_stick_nicht_gefunden;
     g.drawString(valueStr, 110 , 176-50-40 - 6);
  
  
//-----------------------------------------------------  

    
  
 //   g.flip();
}





//---------------------------------------------------  

//vati

function Alpha_Stick_Kontakt ()
{
  if (Alpha_Stick_Kontakt_vorhanden == 0)
  {
  
    Bangle.buzz(100);
    
  }
  
  
}




//---------------------------------------------------  



// Prüfen ob ein Bit gesetzt ist
function TEST_BIT(value, bit) 
{
    return (value & (1 << bit)) !== 0;
}

// Bit setzen
function SET_BIT(value, bit) 
{
    return value | (1 << bit);
}

// Bit löschen
function CLR_BIT(value, bit) 
{
    return value & ~(1 << bit);
}


// 3. Entferne 0xFF selbst und alles davor
function trimUpToFF(array) 
{
    var ffIndex = array.indexOf(0xFF);
    if (ffIndex !== -1) 
    {
        
      
      console.log("\n 0xFF gefunden ",ffIndex);
      
       var array_neu = array.slice(ffIndex + 1);
      
      console.log("\n array_neu len :", array_neu .length);
      
      return array_neu;
      
      return array.slice(ffIndex + 1); // Ab dem nächsten Element nach 0xFF
      
      
    }
    return [];
}


function runden (wert)
{
  
   return + wert.toFixed(2);
  
}



//---------------------------------------------------------------------------------


function Messwerte_dekodieren(advertising_array)
{
  
  // Hex-Darstellung ohne Array.from()
  let hexStr = "";
  let pos=0;            
  let i;
  let hex;
  let hexx;
  
  
  
/*  
  0x51
  0x83
  0x6D
  0xAD
  0xE2
  0x58
  0x6A
  0x0B
  0x00
  0x06
  0x00
  0x03
  0x00
  0x05
  0x00
*/  
  
  
  
  
  
  
  
           
  buffer_1=  new Uint8Array(10);
  
  let  buffer  = [];

  buffer [0] = 0;
  buffer [1] = 1;
  buffer [2] = 255;
  buffer [3] = 3;
  buffer [4] = 4;
 
  
  var startTime = Date.now();  // Millisekunden seit 1970
  
  
  
  console.log("\n 1 buffer len :", buffer.length);            
  console.log("\n 2 buffer_1 len :", buffer_1.length);            

  
  
  
console.log("\n 3------> advertising len    :", advertising_array.length);
console.log("\n 4------> advertising len    :", advertising_array.length);
              
// vati  
    
//advertising_array_neu = trimUpToFF(advertising_array);

//*****************  

    var ffIndex = advertising_array.indexOf(0xFF);
    if (ffIndex !== -1) 
    {
        
      
      console.log("\n 5 0xFF gefunden ",ffIndex);
      
       advertising_array_neu =  advertising_array.slice(ffIndex + 1);
    
    }
    else  
    {
      console.log("\n 5  **KEIN ** 0xFF gefunden ",ffIndex);
  
      return;
    }
   
//*******************  
  
console.log("\n 6------> advertising_array_neu len :", advertising_array_neu.length);
  
  
//******************* TEST Array erzeugen *******************
 
           
//advertising_array_neu =  new Uint8Array(15); 

  
  
/*
  
advertising_array_neu =  new Uint8Array(15); 
    


 advertising_array_neu[0]  = 0x51 ;  // 0101 0001 
 advertising_array_neu[1]  = 0x83 ;  // 1000 0011
 advertising_array_neu[2]  = 0x6D ;  // 0110 1101
 advertising_array_neu[3]  = 0xAD ;  // 1010 1101
 advertising_array_neu[4]  = 0xE2 ;
 advertising_array_neu[5]  = 0x58 ;
 advertising_array_neu[6]  = 0x6A ;
 advertising_array_neu[7]  = 0x0B ;
 advertising_array_neu[8]  = 0x00 ;
 advertising_array_neu[9]  = 0x06 ;
 advertising_array_neu[10] = 0x00 ;
 advertising_array_neu[11] = 0x03 ;
 advertising_array_neu[12] = 0x00 ;
 advertising_array_neu[13] = 0x05 ;
 advertising_array_neu[14] = 0x00 ;
  
*/
  
  
//***********************************************************
  
  

  
  console.log("\n 7 advertising len :", advertising_array.length);
  
 
   for (i = 0; i < advertising_array.length; i++) 
  {
    
    
    hex = advertising_array[i].toString(16);     // wandelt das Array in einen String um !!
    if (hex.length < 2) hex = "0" + hex;
    hexStr += hex + " ";
               
  }
                
  console.log("\n 8  Hex:", hexStr.trim()); 
  
//  console.log("\n************");  
  
  
  console.log("\n 9 advertising_array_neu len :",   advertising_array_neu.length);
   
   hexStr = "";
   for (i = 0; i < advertising_array_neu.length; i++) 
  {
    
    
    hex = advertising_array_neu[i].toString(16); // Array in  String !!
    if (hex.length < 2) hex = "0" + hex;
    hexStr += hex + " ";
               
  }
          
  console.log("\n 10 Hex:", hexStr.trim()); 
  
/*
  
    
  trimUpToFF(advertising_array);
  

 
  for (i = 0; i < advertising_array.length; i++) 
  {
    
    
    hex = advertising_array[i].toString(16);     // wandelt das Array in einen String um !!
    if (hex.length < 2) hex = "0" + hex;
    hexStr += hex + " ";
               
  }
  
  
  
  console.log("\n advertising_array.length:", advertising_array.length);            

  
  
  
  
  
  
          

  console.log("\n Hexx:", hexStr.trim()); 
  */
  
  
/******************** Dekodieren *********************
  
/* C  
 index = 0;
  hv_entlade_zeit   = manufacturer_data[index++]; ;
  hv_impuls_zaehler = manufacturer_data[index++]; ;;  

  if (TEST_BIT(hv_impuls_zaehler,BIT_7))  // ist das HV_FLAG  gesetzt ???
  {
    mess_data.hv_status = true;
  }
  else
  {
    mess_data.hv_status = false;
  }
*/  
  
  
  
/*  
  advertising_array_neu[0]  = 0x51 ;  // 0101 0001 
  advertising_array_neu[1]  = 0x83 ;  // 1000 0011
*/ 

  let advertising_nummer;
  let batterie_spannung_temp;              // 16Bit
  let temperatur_temp;                     // 16Bit
  let temp;  // 64 Bit
  
  
  let manufacturer_data_header;
  let index = 0;
 
  
  let mess_data_hv_status;
   
  let mess_data_messwerte_neu = [15]; // wenn Bit true, dann neuer Messwert 
  
  
 /***************** Global ************** 
  
 let batterie_spannung=0;                            // Batteriespannung Leerlauf
 let batterie_spannung_grenzwert_1 = 3.0;            // Batteriespannung gelb wenn zwischen 2.7 - 3.0 V über 3V grün
 let batterie_spannung_grenzwert_2 = 2.7;            // Batteriespannung < 2.7 rot 

 let hv_batterie_spannung=0;                         // Batteriespannung unter Volllast
 let hv_batterie_spannung_grenzwert_1 = 2.7;         // Batteriespannung gelb wenn zwischen 2.4 - 3.0 V über 3V grün
 let hv_batterie_spannung_grenzwert_2 = 2.4;         // Batteriespannung < 2.4 rot 

 let temperatur = 0;
  
 let temperatur_grenzwert_1 = 0;                     // unter 0 Grad Celsius, ist die Temperaturanzeige blau darüber gelb
 let temperatur_grenzwert_2 = 40;                    // ab 40 Grad Celsius 

*/
  
//-------
// global let advertising_zaehler=0;                         // zählt die Advertising Telegramme

// global  let anzahl_advertising_telegramme=0;               // zählt die korrekten Advertising Telegramme
 
 let advertising_header;
 let system_fehler=0;                      
 let fehler_code_in_advertising;

/*    sind jetzt global 
 let GMZ_Impulse_pro_Minute=0;              
 let GMZ_Impulse_pro_Minute_merker=0;
 let GMZ_Impulse_pro_Minute_MAX_Wert=0;
 let GMZ_Impulse_pro_Minute_MIN_Wert=0xFFFF;
*/ 
 
  
//------  
  

  hv_entlade_zeit   = advertising_array_neu[index++];
  hv_impuls_zaehler = advertising_array_neu[index++];
  

  
  if(TEST_BIT(hv_impuls_zaehler,BIT_7) == 1)            // das funktioniert
   {
     mess_data_hv_status = 1;
   }
    else
   {
     mess_data_hv_status = 0;
   }
  
   console.log("\n --------- mess_data_hv_status : ", mess_data_hv_status); 
  
  
  
/*C     
  mess_data.messwerte_neu[hv_status_neu] = true;   // kennzeichnen, das neue Messwerte da sind 
  
  CLR_BIT(hv_impuls_zaehler,BIT_7);             // oberstes Bit löschen 


//  hv_parameter_darstellen (hv_entlade_zeit , hv_impuls_zaehler);

  mess_data.hv_timer = hv_entlade_zeit/2;               // da 500ms Takt und Sekunden gewünscht sind  
  mess_data.messwerte_neu[hv_timer_neu]  = true;       // kennzeichnen, das neue Messwerte da sind 
  
  mess_data.hv_puls  = hv_impuls_zaehler;
  mess_data.messwerte_neu[hv_puls_neu]   = true;
*/
  
  
  mess_data_messwerte_neu[hv_status_neu] = 1;          // kennzeichnen, das neue Messwerte da sind   
  
  
  //console.log("\n-> hv_impuls_zaehler : ",hv_impuls_zaehler ); 
  
  hv_impuls_zaehler = CLR_BIT(hv_impuls_zaehler,BIT_7);                    // oberstes Bit löschen 
 
  console.log("\n-> hv_impuls_zaehler : ",hv_impuls_zaehler ); 
  
  
  mess_data_hv_timer = hv_entlade_zeit/2;              // da 500ms Takt und Sekunden gewünscht sind  
  
  // mess_data_hv_timer = Math.trunc(mess_data_hv_timer);
  
  mess_data_hv_timer = mess_data_hv_timer | 0; 
  
  mess_data_messwerte_neu[hv_timer_neu]  = 1;          // kennzeichnen, das neue Messwerte da sind 
  
  console.log("\n-> mess_data_hv_timer", mess_data_hv_timer); 
  
  
  
  mess_data_hv_puls  = hv_impuls_zaehler;
  mess_data_messwerte_neu[hv_puls_neu]   = 1;
   
  //console.log("\n  mess_data_hv_puls",  mess_data_hv_puls); 
  
  
/*C
 manufacturer_data_header = manufacturer_data[index];

  if (manufacturer_data_header < 0xFF)        // nur wenn kein Schwerer Fehler aufgetreten ist.
  {

        index++;
//        printf("Mandata: %d\n",manufacturer_data_header);

        advertising_nummer= manufacturer_data_header & 0x03;         // BIT0,BIT1 = Nummer
//        printf("advertising_nummer: %d\n",advertising_nummer);
        
//4d ea42 f05c 1300 030003000500

        if (TEST_BIT(manufacturer_data_header,BATT_SPANNUNG_FLAG))  // ist das Batterie Flag gesetzt
        {
// 0x42EA = 17130
// 0x42 = 66
// 0xEA = 234
/*            
            temp= manufacturer_data[index];
            printf("temp: %d\n",temp);

            temp= manufacturer_data[index+1];
            printf("temp: %d\n",temp);

            batterie_spannung_temp = manufacturer_data[index] + (manufacturer_data[index+1]<<8);
            index=index+2;                              // zeigt auf den nächsten Messwert

//    SET_BIT(batterie_spannung_temp,BIT15);



//vati


*/

//  advertising_array_neu[2]  = 0x6D ;  // 0110 1101
  
  manufacturer_data_header = advertising_array_neu[index];
      
  console.log("\n manufacturer_data_header ", manufacturer_data_header ); 
  //   console.log("\n manufacturer_data_header ", manufacturer_data_header ); 
 
  
//vati
//  if (manufacturer_data_header < 0xFF)        // nur wenn kein Schwerer Fehler aufgetreten ist.
  if (manufacturer_data_header != 0xFF)        // nur wenn kein Schwerer Fehler aufgetreten ist.
 
  {

        index++;
    
    console.log("\n manufacturer_data_header ", manufacturer_data_header ); 
 
    advertising_nummer= manufacturer_data_header & 0x03;         // BIT0,BIT1 = Nummer
 
    console.log("\n advertising_nummer ", advertising_nummer ); 
       
 //   99 =   0110 0011    const BATT_SPANNUNG_FLAG        = BIT_2 ;

//vati    
       if (TEST_BIT(manufacturer_data_header,BATT_SPANNUNG_FLAG)==1)  // ist das Batterie Flag gesetzt
       {

//            batterie_spannung_temp = manufacturer_data[index] + (manufacturer_data[index+1]<<8);
          batterie_spannung_temp = advertising_array_neu [index] + (advertising_array_neu [index+1]<<8);
         
          index=index+2;                              // zeigt auf den nächsten Messwert

// luise          
        
        if (TEST_BIT(batterie_spannung_temp,BATT_SPG_MESSUNG_HV) == 1)   // dann HV Spannung 
        {
              if (TEST_BIT(batterie_spannung_temp,BATT_SPG_MESSUNG_REF_2_5) == 1)   // 2.5V Ref Spannungs Bit gesetzt 
              {
                    hv_batterie_spannung =  batterie_spannung_temp & 0x3FF;         // nur untere 11 Bit verwenden
                    hv_batterie_spannung = (2.5/512) * hv_batterie_spannung;
                    
                    hv_batterie_spannung = runden( hv_batterie_spannung);
                    
                    console.log("\n->hv_batterie_spannung (REF:2.5V)  ",  hv_batterie_spannung ); 
 
                    mess_data_hv_batt = hv_batterie_spannung;
                    mess_data_messwerte_neu[hv_batt_neu]  = 1;                      // kennzeichnen, das neue Messwerte da sind

              }       
              else
              {
                    hv_batterie_spannung =  batterie_spannung_temp & 0x3FF;        // nur untere 11 Bit verwenden
                    hv_batterie_spannung = (1.5/512) * hv_batterie_spannung;
                    
                    runden( hv_batterie_spannung);
                    
                    console.log("\n->hv_batterie_spannung (REF:1.5V)  ",  hv_batterie_spannung ); 
          
                    mess_data.hv_batt = hv_batterie_spannung;
                    mess_data.messwerte_neu[hv_batt_neu]  = 1 ;       // kennzeichnen, das neue Messwerte da sind

              }
              
              
          }
          
          else
          {
          
              if (TEST_BIT(batterie_spannung_temp,BATT_SPG_MESSUNG_REF_2_5) == 1)   // 2.5V Ref Spannungs Bit gesetzt 
              {
                    batterie_spannung =  batterie_spannung_temp & 0x3FF;         // nur untere 11 Bit verwenden
                    batterie_spannung = (2.5/512) * batterie_spannung;
                    
                    batterie_spannung = runden( batterie_spannung);
                
                    console.log("\n->batterie_spannung (REF:2.5V)  ",  batterie_spannung ); 
                
                
                
                
                
                    mess_data_batt = batterie_spannung;
                    mess_data_messwerte_neu[batt_neu]  = 1;             // kennzeichnen, das neue Messwerte da sind

              }       
              else
              {
                    batterie_spannung =  batterie_spannung_temp & 0x3FF;        // nur untere 11 Bit verwenden
                    batterie_spannung = (1.5/512)*  batterie_spannung;
                    batterie_spannung = runden( batterie_spannung);
                    
                    console.log("\n->batterie_spannung (REF:1.5V)  ",  batterie_spannung ); 
                    
                    mess_data_batt = batterie_spannung;
                    mess_data.messwerte_neu[batt_neu]  = 1;       // kennzeichnen, das neue Messwerte da sind

              }             
              
          }
         
        }

/*         
const BATT_SPANNUNG_FLAG        = BIT_2 ;
const TEMPERATUR_FLAG           = BIT_3 ;
const SYSTEM_FEHLER_FLAG        = BIT_4 ;
const GMZ_MINUTE_FLAG           = BIT_5 ;
const GMZ_LOW_RATE_FLAG         = BIT_6 ;
const GMZ_HIGH_RATE_FLAG        = BIT_7 ;


*/       
//       99 =   0110 0011    const BATT_SPANNUNG_FLAG        = BIT_2 ;      
         
        if (TEST_BIT(manufacturer_data_header,TEMPERATUR_FLAG) == 1)
        {
            temperatur_temp = advertising_array_neu [index] + (advertising_array_neu [index+1]<<8);
            
            index=index+2;                              // zeigt auf den nächsten Messwert

            temperatur  = ((temperatur_temp*175.72)/65536)-46.85;
            
            temperatur = runden( temperatur);   
          
           console.log("\n->Temperatur   ",  temperatur  ); // 3V orkomma, 1 Nachkomma
                    
//          temperatur_darstellen (temperatur);

            mess_data_temperatur = temperatur;
            mess_data_messwerte_neu[temperatur_neu]  = 1 ;       // kennzeichnen, das neue Messwerte da sind
        }  
 
// luise         
         
         
         
        console.log("\n*****->Systemfehler: testen  *****", system_fehler   ); 
        
        if (TEST_BIT(manufacturer_data_header,SYSTEM_FEHLER_FLAG) == 1) // wenn das Flag gesetzt ist, werden keine
        {                                                               // weiteren Messdaten angezeigt bzw. ausgewertet !
            
           system_fehler = advertising_array_neu [index] + (advertising_array_neu [index+1]<<8);
          
           index=index+2;                          // zeigt auf den nächsten Messwert
           

          
          console.log("\n->Systemfehler: ", system_fehler   ); 
          
        }
        else
        {

//       Minutenmesswerte werden immer übertragen, wenn kein Fehler vorliegt !!

            GMZ_Impulse_pro_Minute = advertising_array_neu[index] + (advertising_array_neu[index+1]<<8);
            
            index=index+2;         
            
            mess_data_GMZ_Impulse_pro_Minute = GMZ_Impulse_pro_Minute;
            mess_data_messwerte_neu[GMZ_Impulse_pro_Minute_neu]  = 1;       // kennzeichnen, das neue Messwerte da sind
          
          // zeigt auf den nächsten Messwert
          
          
          
          
          if (GMZ_Impulse_pro_Minute > GMZ_Impulse_pro_Minute_MAX_Wert)
          {
            
            GMZ_Impulse_pro_Minute_MAX_Wert = GMZ_Impulse_pro_Minute;
          }
          
          
//vati          
          
           if ( betriebsmodus === GMZ_GROSS ) 
           {
             gmz_anzeige ( GMZ_Impulse_pro_Minute );
             // gmz_anzeige ( 9999);
           }
           
           if ( betriebsmodus === SERVICE ) 
           {
             messwert_anzeige();
           }
     
          
//            messwert_anzeige() ;
          
          
          
          
            console.log("\n->  ********GMZ_Impulse_pro_Minute: ", GMZ_Impulse_pro_Minute, "*******"); 
        
          
// luise       
          
            if (anzahl_advertising_telegramme == 0)               // das erste Telegramm nach Kaltstart ist gekommen  
            {
          
              anzahl_advertising_telegramme++;
              
              if (TEST_BIT(manufacturer_data_header,GMZ_MINUTE_FLAG) == 1)  // dieses Flag toggelt, wenn ein neuer Wert vorhanden ist
              {
                GMZ_MINUTE_FLAG_merker = TEST_BIT(manufacturer_data_header,GMZ_MINUTE_FLAG); //GMZ_MINUTE_FLAG;                           // Flag merken 
              }
              else
              {
                GMZ_MINUTE_FLAG_merker=0;
              }

//               GMZ_Impulse_pro_Minute_darstellen (GMZ_Impulse_pro_Minute);   // Nach Kaltstart "alten" Wert sofort darstellen
              
            }
            else
            {
              anzahl_advertising_telegramme++;
// vati        
              
              
              
              if (TEST_BIT(manufacturer_data_header,GMZ_MINUTE_FLAG) != GMZ_MINUTE_FLAG_merker ) // wenn sich Flag geändert, dann neuer Minuten Wert vorhanden
              {       

 //               console.log("\n****** HIER *******\n");
                
                
                GMZ_MINUTE_FLAG_merker = TEST_BIT(manufacturer_data_header,GMZ_MINUTE_FLAG);   // Flag merkern 0 oder 32 wenn gesetzt !                
                
                GMZ_Impulse_pro_Minute_neu_flag = 1;

                mess_data_GMZ_Impulse_pro_Minute_neu_flag = GMZ_Impulse_pro_Minute_neu_flag;



                
                GMZ_Minuten_zaehler++;                 // jede Minute ein neuer Messwert
                
                         
                console.log("\n--------->GMZ_Minuten_zaehler: ", GMZ_Minuten_zaehler   ); 
                
                console.log("\ Messdaten werden gespeichert"); 
 
//vati           

 
      
//const GREEN_GRENZWERT  = 30 ;
//const YELLOW_GRENZWERT = 50 ;


                if ( GMZ_Impulse_pro_Minute > GREEN_GRENZWERT )
                {
                  DailyLogger.log(GMZ_Impulse_pro_Minute);
                }
                
                
                
                
/*             
                temp=(esp_timer_get_time()-zeit_merker_1)/1000000;    // in s
                zeit_merker_1= esp_timer_get_time();

                temp=(millis()-zeit_merker_1)/1000;    // in s
                zeit_merker_1= millis();

  
                Serial.printf("Neuer Minuten Messwert nach : %d s\r\n",temp ); // Printet die Zeit zwischen 2 Minuten Messwerten in Sekunden
*/  
                
                
//              Serial.println(temp);   
  //              Serial.printf(" s \r\n");

/*                
                Serial.printf("    GMZ_MINUTE_FLAG : ");
                Serial.println(TEST_BIT(manufacturer_data_header,GMZ_MINUTE_FLAG));   // Printet die Zeit zwischen 2 Minuten Messwerten in Sekunden
                Serial.printf("\n\r");
                Serial.println(GMZ_MINUTE_FLAG_merker ); 
                Serial.printf("\n\r");
*/                
//                GMZ_Minuten_zaehler_darstellen(GMZ_Minuten_zaehler);

//               GMZ_Impulse_pro_Minute_darstellen (GMZ_Impulse_pro_Minute);
                
              }

//vati --          anzahl_advertising_telegramme  
            
      
            
          
          
          
        
       
           
        }        
    

          
          }
               
       
      

          
//luise    
        
  
  }

  else
  {
 
  
  
  
  }
  

  var endTime = Date.now();
var executionTime = endTime - startTime;

console.log("***********Ausführungszeit:", executionTime, "ms");
  
  
  
  
}
//Private Sub Messwerte_dekodieren(advertising_array() As Byte) As Boolean


//************************************************************************************
function startScan() 
{
   Scanning = true;   // zeigt an das Scanning läuft 
  
  
   
// Max_Anzahl_Scan_Versuche
// var Scan_Versuche = 0;
  
  
  console.log("\n\nScan wird gestartet ");
   
   startTime = Date.now();  // Millisekunden seit 1970
  
/*  
   //NRF.requestDevice({ active: true , timeout: 11000 , filters: [{ name: "AS_7" }] 

   namePrefix: bedeutet, das nach dem Namen AS_7  z.B  noch Zahlen kommen könnten 
   tolle Sache !!

*/  
   NRF.requestDevice({ active: true , timeout: 11000 , filters: [{   namePrefix: "AS_" }] 
     
   }).then(function(device) {
      
      console.log("\nAlpha Stick gefunden");
      console.log("Name:"   , device.name);
      console.log("Address:", device.id);
      console.log("RSSI:"   , device.rssi);
      
      Alpha_Stick_Kontakt_vorhanden = true ;
      Alpha_Stick_RSSI = device.rssi;
      
     Scan_Versuche = Max_Anzahl_Scan_Versuche ;
     
//vati     
        endTime = Date.now();
        executionTime = endTime - startTime;
        executionTime = executionTime.toFixed(0);
        console.log("Ausführungszeit:", executionTime, "ms");   
      //handleSensorData(device);
     
    Scan_Timer_1 = setTimeout(startScan, 9700); // Nächster Scan
     
     
     var dataFields = ['data'];   // nur nach data Daten suchen
     console.log("dataFields.length:"   , dataFields.length);
     let i=0;
     let field = dataFields[i];
     if (device[field] !== undefined) 
     {
        let data = new Uint8Array(device[field]);
        if (data.length > 0) 
        {
          console.log(field + ":", "  Length:", data.length);
          
             
              // Hex-Darstellung ohne Array.from()
              var hexStr = "";
              var decStr = "";
              for ( i = 0; i < data.length; i++) 
              {
                var hex = data[i].toString(16);
                if (hex.length < 2) hex = "0" + hex;
                hexStr += hex + " ";
                decStr += data[i] + ",";
              }

            console.log("  Hex:", hexStr.trim());
//          console.log("  Dec:", decStr.slice(0, -1)); // letztes Komma entfernen
                    
              telegramm_zaehler++;
              
              Messwerte_dekodieren(data);
              
              foundSensor = true;
              
              
           // messwert_anzeige(telegramm_zaehler++);
          
          
        } 
       
  
     }
     else
     {
     
      console.log("FEHLER -->Nichts gefunden");
     }
     
     

    }).catch(function(error) {

        
        
        Alpha_Stick_Kontakt_vorhanden = false ;
        
      //  Alpha_Stick_RSSI = 0;
        
     Scan_Timer_1 = setTimeout(startScan, 1000);
        
        Bangle.buzz(100);
        
        alpha_stick_nicht_gefunden++;
        
        GMZ_Impulse_pro_Minute = 0;  // zeigt an, das kein gültiger Wert vorhanden 
        
       console.log("SCAN Beendet --> !!!!! Nichts gefunden !!!!!");
//vati    
        Scan_Versuche--;
        
        if ( Scan_Versuche === 0)
        {
          betriebsmodus = GMZ_GROSS ;
          menue_anzeigen("STOP",RED);
          
          clearTimeout( Scan_Timer_1 );
          Scanning = false ;  
     
//----- wenn Alpha Stick nicht gefunden, wird Touch möglich auch ohne Tastenbetätigung ----
     
// ?????????       Bangle.setOptions({lockTimeout: 5000}) ;// turn off the timeout
     
        }
     
//-----------------------------------------------------------------------------------------     
     
      if ( betriebsmodus === GMZ_GROSS ) 
        
      {
        
        gmz_anzeige (0);  
      
       
        
      }
      if ( betriebsmodus === SERVICE ) 
      {
 // vati      messwert_anzeige();
  
      }
     
     
    });
    
}



//---------------------------------------------------------------


//------------------ Taste Abfrage --------------  ---


/*
datei_liste ();                                        // zeigt alle Datein an
require("Storage").erase("RADIATION_2025-08-23.csv");  // löscht Datein
require("Storage").erase("RADIATION_2025-08-24.csv");
datei_liste ();
*/

//datei_liste ();


//console.log("\nVerfügbare Log-Dateien:", DailyLogger.listLogFiles());

//console.log("\nVerfügbare Log-Dateien:", DailyLogger.readToday());

console.log("\nIDE Connected:", isIDEConnected() );



g.clear();


betriebsmodus = GMZ_GROSS ;

//betriebsmodus = SERVICE;



Bangle.setOptions({backlightTimeout: 5000}) ;// turn off the timeout
Bangle.setOptions({lockTimeout: 5000}) ;// turn off the timeout

//**********************

E.on('kill', function()    // wird noch aufgerufen, wenn APP abgebrochen wurde
{
  console.log("Bye!");
});

//**********************



setWatch(function() {
  console.log("Pressed");
}, BTN, {edge:"rising", debounce:50, repeat:true});
//-----------------------------------------------------


Bangle.on('touch', function(button, xy) {
    console.log("Touch:", xy.x, xy.y);
    
   if ( xy.x > 0  && xy.y < GMZ_Touch_y2 && xy.y > GMZ_Touch_y1 ) 
   {

      console.log("-------->links oben ");
      Bangle.buzz(50);
     
      betriebsmodus++ ; 
      
      if ( Scanning === true )    // nur wenn Scanning noch aktiv, dann umschalten 
      {
     
        if ( betriebsmodus === GMZ_GROSS ) 
        {

          Uhrzeit_Timer_1 = setInterval(function() {uhrzeit_darstellen( 10 , 110 , 60);}, 1000);
  
        } 
        else if (betriebsmodus === SERVICE) 
        {
          g.clear();
          menue_anzeigen("SCAN",GREEN);
          clearInterval( Uhrzeit_Timer_1 );
        }
        else
        {
          g.clear();
          menue_anzeigen("SCAN",GREEN);
          betriebsmodus = GMZ_GROSS ;
          Uhrzeit_Timer_1 = setInterval(function() {uhrzeit_darstellen( 10 , 110 , 60);}, 1000);
        }
     
      }
      else
      {
        Scan_Versuche = Max_Anzahl_Scan_Versuche ;
        startScan();      
      }
/*     
     
     
      if (betriebsmodus === ENDE)
      {
        betriebsmodus = 0;
      }
*/      
      console.log("betriebsmodus : ", betriebsmodus);    
     
   }
  
  
  
  
  
  
  
  
  /*
    // Einfache Bereichsaufteilung
    if (xy.x < 88 && xy.y < 88) 
    {
        // Links oben - Modus +
       // cycleMode();
      console.log("links oben ");
      
    } else if (xy.x >= 88 && xy.y < 88) 
    {
        // Rechts oben - manueller Scan
       // manualScan();
       console.log("rechts oben ");
    } else 
    {
        // Unten - andere Funktion
      //  toggleDisplay();
       console.log("unten");
      Bangle.buzz(50);
      
      betriebsmodus++ ; 
      if (betriebsmodus === ENDE)
      {
      betriebsmodus = 0;
      }
      
      console.log("betriebsmodus : ", betriebsmodus);
      
       }
  
   // console.log("Touch:");
   
   */
});





console.log(" ***** Suche Alpha Stick ***** ");



  if ( betriebsmodus === GMZ_GROSS ) 
  {

     Uhrzeit_Timer_1 = setInterval(function() {uhrzeit_darstellen( 10 , 110 , 60);}, 1000);
  
  }

Scan_Versuche = Max_Anzahl_Scan_Versuche ;

menue_anzeigen("SCAN",GREEN);
startScan(); 



/*-------------------- ALT -------------

//findMySensor();
//vati



setInterval(findMySensor, SCAN_INTERVAL);
//setInterval(test, 10000);

setInterval(Alpha_Stick_Kontakt, 2000);

*/









console.log(" ***** Suche Alpha Stick ***** ");
//
     
//***************** TEST Bereich *****************

// Prüfen ob ein Bit gesetzt ist
/*
function TEST_BIT(value, bit) 
{
    return (value & (1 << bit)) !== 0;
}

*/

/*

buffer_1=  new Uint8Array(10);
  
//  let  buffer  = [];

let index=0;

  buffer_1 [0] = 0;
  buffer_1 [1] = 1;
  buffer_1 [2] = 128;
  buffer_1 [3] = 3;
  buffer_1 [4] = 4;
  
  index ++;
  index ++;

  let wert = buffer_1 [index];

  wert = wert >> 1 ;         // Bit schieben nach rechts 
  wert = wert << 1 ;

   console.log("\n wert : ",wert); 

   

  console.log("\n buffer len :", buffer_1.length);    

   if(TEST_BIT(wert,BIT_7) == 0)
   {
     console.log("\n BIT_7 nicht gesetzt"); 
   }
    else
   {
    console.log("\n BIT_7 gesetzt"); 
   }


  wert =300;

mess_data_timestamp=123;

   console.log("\n mess_data_timestamp :", mess_data_timestamp ); 

   console.log("\n wert :", wert ); 
*/

/*

 if( TEST_BIT(buffer_1(0),BIT_7) == TRUE)
 {
  
   console.log("\n BIT_7 gesetzt"); 
  
 }
 
 if( TEST_BIT(buffer_1(0),BIT_7) == FALSE)
 {
   console.log("\n BIT_7 nicht gesetzt"); 
   
 }

*/















