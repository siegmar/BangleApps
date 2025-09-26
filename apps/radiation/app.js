/*
26.8.2025 TO DO  status_zeile_anzeigen nur, wenn sich Werte verändert haben
                 oder bei lock und unlock sofort !!

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



//const GREEN_GRENZWERT  = 30 ;
//const YELLOW_GRENZWERT = 50 ;



 

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

 const Max_Anzahl_Scan_Versuche = 6;


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
 var GMZ_Touch_y1 =  28;                  // dieser Bereich schaltet die Einheiten um !
 var GMZ_Touch_x2 = 176;
 var GMZ_Touch_y2 = 100;                  // Modusumschaltung im Uhren bereich






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
 var Alpha_Stick_RSSI_merker = 0;

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

let GMZ_Minuten_zaehler=1;
let GMZ_Minuten_zaehler_merker=0;
let color_merker=1;

var button_click_zaehler = 0;


//************************************************



const  GMZ = 0;
const  uSv = 1;

// === GLOBALE EINSTELLUNGEN ===
var GLOBAL_SETTINGS = {
    GREEN_GRENZWERT   : 35,
    YELLOW_GRENZWERT  : 50,
	  messwert_einheit  : uSv,
	  backlightTimeout  : 10,   // in Sekunden 
    lockTimeout       : 30,
    warte_linie       : false,  // warte Linie bis der nächste Messwert kommt braucht viel Enerie, deshalb abschaltbar !
    keine_grenzwerte  : false
  
};
var messwert_einheit_merker = GMZ;     // !!!!! Wichtig, sonst wird nix dargestellt


var messwert_einheit_position = {
    x1: 80,
    y1: 100,
	  x2: 176,
    y2: 123
};





// GLOBALE VARIABLE für Datei-Liste
var GLOBAL_FILE_LIST = {
    files: [],                      // Sortierte Dateinamen
    count: 0,                       // Anzahl Dateien
    dateiname:"RADIATION_LIST.txt"  // hier stehen die Dateinamen der gespeicherten Log Datein
};

//  GLOBAL_FILE_LIST.dateiname




//*********************************** Programme *****************************


function radiation_settings_abspeichern()
 {
    try {
        console.log("=== UEBERGEBE PARAMETER UEBER SETTINGS ===");
        
        // Settings speichern
        var settings = {
			      messwert_einheit : GLOBAL_SETTINGS.messwert_einheit,
            GREEN_GRENZWERT  : GLOBAL_SETTINGS.GREEN_GRENZWERT,
            YELLOW_GRENZWERT : GLOBAL_SETTINGS.YELLOW_GRENZWERT,
            warte_linie      :  GLOBAL_SETTINGS.warte_linie , 
            keine_grenzwerte :  GLOBAL_SETTINGS.keine_grenzwerte
                  
        };
        
        require("Storage").write("radiation_settings.json", JSON.stringify(settings));
        console.log("? Settings gespeichert");
        
           } catch (e) {
        console.log("? Fehler bei Settings:", e.message);
    }
}

//--------

function radiation_setting_laden() {
    try 
    {
        console.log("=== radiation_settings.json ===");
        
        var settingsData = require("Storage").read("radiation_settings.json");
        if (settingsData) 
		    {
            var settings = JSON.parse(settingsData);
            console.log("? Settings empfangen:", settings);
   
            GLOBAL_SETTINGS.messwert_einheit = settings.messwert_einheit;
          
            if (GLOBAL_SETTINGS.messwert_einheit === GMZ)
				    {
              messwert_einheit_merker = uSv;      // wegen Anzeige
            }
            else
            {
              messwert_einheit_merker = GMZ;     // wegen Anzeige
            }
          
			      GLOBAL_SETTINGS.GREEN_GRENZWERT  = settings.GREEN_GRENZWERT;
			      GLOBAL_SETTINGS.YELLOW_GRENZWERT = settings.YELLOW_GRENZWERT;
			      GLOBAL_SETTINGS.warte_linie      = settings.warte_linie;
            GLOBAL_SETTINGS.keine_grenzwerte = settings.keine_grenzwerte;
                     
			
            return true;
        } 
     } catch (e) 
	   {
        console.log("? Settings-Fehler:", e.message);
     }
    return false;

}




//--------
// === EXAKTE UMRECHNUNG AUS DEINEN DATEN ===
var EXACT_CONVERSION = {
    // LINEARE Regression aus deinen Daten:
    slope: 0.0065,    // Sehr genau!
    intercept: 0.0,   // Fast kein Offset!
    
    // Umrechnungsfunktion
    cpmToUSV: function(cpm) {
        try {
            // EXAKTE Formel aus deinen Daten:
            var usv = cpm * 0.0065;
            return usv;
            
        } catch (e) {
            return 0.0;
        }
    },
    
    // Umgekehrte Umrechnung
    usvToCPM: function(usv) {
        try {
            // EXAKTE Formel:
            var cpm = usv / 0.0065;
            return Math.round(cpm);
            
        } catch (e) {
            return 0;
        }
    }
};

// === INTELLIGENTE UMRECHNUNG FÜR DEINE ANZEIGE ===
function intelligentConversionForDisplay(cpm) {
    try {
        // EXAKTE Umrechnung aus deiner Liste:
        var usv = cpm * 0.0065;
//       return usv.toFixed(2).padStart(6, ' '); // 6-stellig mit 2 Nachkommastellen
        return usv.toFixed(2).padStart(2, ' '); // 2-stellig mit 2 Nachkommastellen
       
    } catch (e) {
        return "0.00";
    }
}

// Aufruf  var usv = intelligentConversionForDisplay(cpm);

//-----------
// Funktion für horizontal zentrierten Text
function drawCenteredText(text, yPosition, fontSize) {
    try {
        console.log("=== ZENTRIERTE TEXT-POSITIONIERUNG ===");
        console.log("Text:", text);
        console.log("Y-Position:", yPosition);
        console.log("Schriftgröße:", fontSize);
        
        // 1. Text-Breite berechnen
        g.setFont("Vector", fontSize);
        var textWidth = g.stringWidth(text);
        console.log("Text-Breite:", textWidth);
        
        // 2. Display-Breite (176 Pixel)
        var displayWidth = 176;
        console.log("Display-Breite:", displayWidth);
        
        // 3. Zentrale X-Position berechnen
        var centeredX = (displayWidth - textWidth) / 2;
        console.log("Zentrale X-Position:", centeredX);
        
        // 4. Text zentriert zeichnen
        g.drawString(text, centeredX, yPosition);
        g.flip();
        
        console.log("✅ Text zentriert gezeichnet!");
        return centeredX; // Rückgabe der X-Position
        
    } catch (e) {
        console.log("❌ Fehler bei Zentrierung:", e.message);
        return 0;
    }
}

//------------------


// === DATEINAME HINZUFÜGEN UND GLOBAL_FILE_LIST AKTUALISIEREN ===

function addNewFilenameToList(newFilename) {
    try {
        console.log("=== FÜGE NEUEN DATEINAMEN HINZU UND AKTUALISIERE LISTE ===");
        console.log("Neuer Dateiname:", newFilename);
        
        // 1. MIT OPEN im Append-Modus speichern
        var f = require("Storage").open( GLOBAL_FILE_LIST.dateiname, "a");
        
        // 2. NEUEN Dateinamen MIT Zeilenumbruch hinzufügen
        f.write(newFilename + "\n");
        console.log("✅ Dateiname im Storage gespeichert!");
        
        // 3. GLEICHZEITIG GLOBAL_FILE_LIST aktualisieren
        GLOBAL_FILE_LIST.files.push(newFilename);  // Ans Ende hängen
        GLOBAL_FILE_LIST.count++;                  // Zähler erhöhen
        
        console.log("✅ GLOBAL_FILE_LIST aktualisiert!");
        console.log("Neue Anzahl:", GLOBAL_FILE_LIST.count);
        console.log("Letzter Eintrag:", GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.count - 1]);
        
        return true;
        
    } catch (e) {
        console.log("❌ Fehler beim Hinzufügen/Aktualisieren:", e.message);
        return false;
    }
}
//---

// === DATEILISTE SPEICHERN OHNE JSON ===
function saveFileList(filename) {
    try {
        console.log("=== SPEICHERE DATEILISTE OHNE JSON ===");
        console.log("Einträge:", GLOBAL_FILE_LIST.files.length);
        
        // MIT OPEN schreiben (nicht append!)
        var f = require("Storage").open(filename, "w");
        
        // ALLE Dateinamen MIT Zeilenumbrüchen
        var content = "";
        for (var i = 0; i < GLOBAL_FILE_LIST.files.length; i++) {
            content += GLOBAL_FILE_LIST.files[i] + "\n";
        }
        
        f.write(content);
        
        console.log("✅ Dateiliste gespeichert!");
        return true;
        
    } catch (e) {
        console.log("❌ Fehler beim Speichern:", e.message);
        return false;
    }
}

//-----
function loadFileList(filename) {
    try {
        console.log("=== LADE DATEILISTE OHNE JSON ===");
        
        // MIT OPEN lesen
        var f = require("Storage").open(filename, "r");
        var fileSize = f.getLength();
        
        if (fileSize === 0) {
            console.log("❌ Leere Cache-Datei");
            GLOBAL_FILE_LIST.files = [];
            GLOBAL_FILE_LIST.count = 0;
            return false;
        }
        
        var content = f.read(fileSize);
        if (!content) {
            console.log("❌ Kein Inhalt");
            GLOBAL_FILE_LIST.files = [];
            GLOBAL_FILE_LIST.count = 0;
            return false;
        }
        
        // ZEILENWEISE aufteilen
        var lines = content.split('\n').filter(line => line.trim() !== "");
        
        // Globale Liste füllen
        GLOBAL_FILE_LIST.files = lines;
        GLOBAL_FILE_LIST.count = lines.length;
        
        console.log("✅ Dateiliste geladen!");
        console.log("Anzahl Einträge:", GLOBAL_FILE_LIST.count);
        return true;
        
    } catch (e) {
        console.log("❌ Fehler beim Laden:", e.message);
        GLOBAL_FILE_LIST.files = [];
        GLOBAL_FILE_LIST.count = 0;
        return false;
    }
}


//------------
function radiation_file_list(filename) 
{   
           try {
  var f = require("Storage").open(filename, "a");
  var fileSize = f.getLength();
            
  if (fileSize === 0) 
	{                                    // es gibt die Liste noch nicht
	  var anzahl= populateFileList();    // gibt die Anzahl  der gefunden LOG Datein wie z.B RADIATION_20_25-08-010.csv
			                                 // Die komplette Liste befindet sich in der globalen Variablen GLOBAL_FILE_LIST.files 
                                       // Anzahl der gefunden Datein in  globalen Variablen GLOBAL_FILE_LIST.count
		if ( anzahl > 0 )                  // ist die Liste vorhanden ?
	  {
		  return saveFileList(GLOBAL_FILE_LIST.dateiname); 
				 
		}
			   
    console.log("Datei wird erzeugt:", filename);
				
  } 
	else 
	{                                     // Liste ist schon vorhanden und wird jetzt geladen 
	  
    console.log("********** LISTE WIRD GELADEN ");
    
    return loadFileList(filename);   
	}
                 
        } catch (e) {
            console.log("Log Fehler:", e);
            return false;
        }
}		
		
//----------------------------------------------------------------	




// === CHRONOLOGISCHE SORTIERUNG OHNE localeCompare ===
function sortLogFileListChronologically() {
    try {
        console.log("=== CHRONOLOGISCHE SORTIERUNG OHNE localeCompare ===");
        console.log("Vorher:", GLOBAL_FILE_LIST.files.length, "Dateien");
        
        // CHRONOLOGISCHE Sortierung OHNE localeCompare
        GLOBAL_FILE_LIST.files.sort(function(a, b) {
            // Datum aus Dateinamen extrahieren und vergleichen
            var dateA = extractSortableDateFromFilename(a);
            var dateB = extractSortableDateFromFilename(b);
            
            // EINFACHER String-Vergleich (funktioniert bei ISO-Datum!)
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            return 0;
        });
        
        // Anzahl aktualisieren
        GLOBAL_FILE_LIST.count = GLOBAL_FILE_LIST.files.length;
        
        console.log("✅ Nachher:", GLOBAL_FILE_LIST.count, "Dateien");
        console.log("Erste:", GLOBAL_FILE_LIST.files[0]);
        console.log("Letzte:", GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.count - 1]);
        
        return true;
        
    } catch (e) {
        console.log("❌ Sortierfehler:", e.message);
        return false;
    }
}

// === DATUM AUS DATEINAMEN EXTRAHIEREN FÜR SORTIERUNG ===
function extractSortableDateFromFilename(filename) {
    try {
        // "RADIATION_2025-09-04.csv" -> "2025-09-04"
        var datePart = filename.replace("RADIATION_", "").replace(".csv", "");
        return datePart; // "YYYY-MM-DD" = bereits sortierbar!
        
    } catch (e) {
        return "9999-99-99"; // Fallback - ans Ende
    }
}


//-----------------------------------------------------------------



// prüft ob Datein zum anschauen vorhanden sind 
// === ROUTINE 1: Dateinamen in Liste eintragen (neueste unten) ===
function populateFileList() {
    try {
        console.log("=== POPULATE FILE LIST ===");
//15_9        
        // Alle Dateien auflisten
        var allFiles = require("Storage").list();
        var radiationFiles = [];
        
        // Nur RADIATION_*.csv Dateien sammeln MIT Bereinigung
        for (var i = 0; i < allFiles.length; i++) {
            var filename = allFiles[i];
            if (typeof filename === 'string') {
                // STEUERZEICHEN BEREINIGEN
                var cleanName = "";
                for (var j = 0; j < filename.length; j++) {
                    var charCode = filename.charCodeAt(j);
                    if (charCode >= 32 && charCode <= 126) {
                        cleanName += filename.charAt(j);
                    }
                }
                
                if (cleanName.startsWith("RADIATION_") && cleanName.endsWith(".csv")) {
                    radiationFiles.push(cleanName);
                }
            }
        }
        
        // Sortieren: neueste zuerst
 //      radiationFiles.sort().reverse();
        
        // Globale Liste füllen
        GLOBAL_FILE_LIST.files = radiationFiles;
        GLOBAL_FILE_LIST.count = radiationFiles.length;
      
       // CHRONOLOGISCHE Sortierung (älteste zuerst)
       sortLogFileListChronologically();
        
        console.log("Gefundene Dateien:", GLOBAL_FILE_LIST.count);
        return GLOBAL_FILE_LIST.count;
        
    } catch (e) {
        console.log("Fehler beim Populate:", e.message);
        GLOBAL_FILE_LIST.files = [];  // ✅ IN SCOPE!
        GLOBAL_FILE_LIST.count = 0;   // ✅ IN SCOPE!
        return 0;
    }
}



//17_09

// Korrigierter CPM-Visualizer für kontinuierliches Wachsen

var CPMVisualizer = {
    enabled: false,
    lineThickness: 2,
    activeColor: '#000000',     // Aktive Farbe
    segmentColor: '#ffffff',    // Segment-Farbe
    backgroundColor: '#ffffff', // Hintergrundfarbe
    yPos: 120,                  // Y-Position
    totalSeconds: 60,           // Gesamt-Sekunden
    segments: 4,                // Anzahl Segmente
    gapWidth: 3,                // Lücke zwischen Segmenten
    currentSecond: 0,
    screenWidth: 176,
    visualizationTimer: null,
    lastPixelEnd: 0,            // Neue Variable: Letztes gezeichnetes Pixel
    
    // Initialisierung
    init: function(yPosition, seconds, segmentCount, gap) {
        if (yPosition !== undefined) this.yPos = yPosition;
        if (seconds !== undefined) this.totalSeconds = seconds;
        if (segmentCount !== undefined) this.segments = segmentCount;
        if (gap !== undefined) this.gapWidth = gap;
        this.currentSecond = 0;
        this.lastPixelEnd = 0;
    },
    
    // Zeichne segmentierte Linie mit Lücken
    drawSegmentedLine: function() {
        this.clearLine();
        
        var segmentWidth = Math.floor((this.screenWidth - (this.segments - 1) * this.gapWidth) / this.segments);
        
        // Segmente in Segmentfarbe zeichnen (Lücken bleiben im Hintergrund)
        for (var i = 0; i < this.segments; i++) {
            var segmentStart = i * (segmentWidth + this.gapWidth);
            var segmentEnd = segmentStart + segmentWidth;
            
            g.setColor(this.segmentColor);
            g.fillRect(segmentStart, this.yPos, segmentEnd, this.yPos + this.lineThickness);
        }
        
        g.flip();
        this.lastPixelEnd = 0; // Reset
    },
    
    // Starte Visualisierung
    startRealTimeVisualization: function() {
        if (!this.enabled) return;
        
        this.currentSecond = 0;
        this.lastPixelEnd = 0;
        this.drawSegmentedLine();
        console.log("Starte kontinuierliche Visualisierung");
        
        var self = this;
        this.visualizationTimer = setInterval(function() {
            self.updateVisualization();
        }, 1000);
    },
    
    // KONTINUIERLICHE Aktualisierung
    updateVisualization: function() {
        if (!this.enabled) return;
        
        // Berechne wie viele Pixel insgesamt aktiv sein sollten
        var totalPixels = this.screenWidth - (this.segments - 1) * this.gapWidth; // Ohne Lücken
        var pixelsPerSecond = totalPixels / this.totalSeconds;
        var targetPixelEnd = Math.floor((this.currentSecond + 1) * pixelsPerSecond);
        
        // Zeichne von lastPixelEnd bis targetPixelEnd
        if (targetPixelEnd > this.lastPixelEnd) {
            this.drawProgressLine(this.lastPixelEnd, targetPixelEnd);
            this.lastPixelEnd = targetPixelEnd;
        }
        
        this.currentSecond++;
        
        // Messung abgeschlossen
        if (this.currentSecond >= this.totalSeconds) {
            this.stopVisualization();
            this.onMeasurementComplete();
        }
    },
    
    // Zeichne Fortschrittslinie unter Berücksichtigung der Segmente
    drawProgressLine: function(fromPixel, toPixel) {
        var segmentWidth = Math.floor((this.screenWidth - (this.segments - 1) * this.gapWidth) / this.segments);
        
        for (var pixel = fromPixel; pixel < toPixel; pixel++) {
            // Finde heraus, in welchem Segment wir sind
            var segmentIndex = 0;
            var pixelInSegments = 0;
            
            // Berechne Segment-Position
            while (segmentIndex < this.segments) {
                var segmentStart = segmentIndex * (segmentWidth + this.gapWidth);
                var segmentEnd = segmentStart + segmentWidth;
                
                if (pixel >= pixelInSegments && pixel < pixelInSegments + segmentWidth) {
                    // Pixel ist in diesem Segment
                    var localPixel = pixel - pixelInSegments;
                    var actualX = segmentStart + localPixel;
                    
                    g.setColor(this.activeColor);
                    g.fillRect(actualX, this.yPos, actualX, this.yPos + this.lineThickness);
                    break;
                }
                
                pixelInSegments += segmentWidth;
                segmentIndex++;
            }
        }
        
        g.flip();
    },
    
    // Einfachere Version - zeichne kontinuierlich
    updateVisualizationSimple: function() {
        if (!this.enabled) return;
        
        var segmentWidth = Math.floor((this.screenWidth - (this.segments - 1) * this.gapWidth) / this.segments);
        var totalActivePixels = this.screenWidth - (this.segments - 1) * this.gapWidth;
        var pixelsPerSecond = totalActivePixels / this.totalSeconds;
        
        // Berechne aktuelle Pixel-Position
        var currentPixel = Math.floor((this.currentSecond + 1) * pixelsPerSecond);
        
        // Zeichne von 0 bis currentPixel
        this.drawContinuousLine(currentPixel);
        
        this.currentSecond++;
        
        // Messung abgeschlossen
        if (this.currentSecond >= this.totalSeconds) {
            this.stopVisualization();
            this.onMeasurementComplete();
        }
    },
    
    // Kontinuierliche Linie zeichnen
    drawContinuousLine: function(upToPixel) {
        var segmentWidth = Math.floor((this.screenWidth - (this.segments - 1) * this.gapWidth) / this.segments);
        var totalActivePixels = this.screenWidth - (this.segments - 1) * this.gapWidth;
        
        g.setColor(this.activeColor);
        
        // Zeichne kontinuierlich bis zum gewünschten Pixel
        for (var i = this.lastPixelEnd; i < Math.min(upToPixel, totalActivePixels); i++) {
            // Berechne tatsächliche X-Position mit Lücken
            var segmentIndex = Math.floor(i / segmentWidth);
            if (segmentIndex >= this.segments) segmentIndex = this.segments - 1;
            
            var pixelInSegment = i % segmentWidth;
            var actualX = segmentIndex * (segmentWidth + this.gapWidth) + pixelInSegment;
            
            g.fillRect(actualX, this.yPos, actualX, this.yPos + this.lineThickness);
        }
        
        g.flip();
        this.lastPixelEnd = upToPixel;
    },
    
    // Stoppe Visualisierung
    stopVisualization: function() {
        if (this.visualizationTimer) {
            clearInterval(this.visualizationTimer);
            this.visualizationTimer = null;
        }
        this.currentSecond = 0;
    },
    
    // Messung abgeschlossen
    onMeasurementComplete: function() {
        console.log("✅ Messung abgeschlossen");
        this.animateCompletion();
    },
    
    // Abschluss-Animation
    animateCompletion: function() {
        // Ganze Linie in aktiver Farbe
        var segmentWidth = Math.floor((this.screenWidth - (this.segments - 1) * this.gapWidth) / this.segments);
        
        g.setColor(this.activeColor);
        for (var i = 0; i < this.segments; i++) {
            var segmentStart = i * (segmentWidth + this.gapWidth);
            var segmentEnd = segmentStart + segmentWidth;
            g.fillRect(segmentStart, this.yPos, segmentEnd, this.yPos + this.lineThickness);
        }
        
        g.flip();
        
        // Nach 1 Sekunde zurück zu Segment-Ansicht
        setTimeout(function() {
            CPMVisualizer.drawSegmentedLine();
        }, 1000);
    },
    
    // Linie löschen
    clearLine: function() {
        g.setColor(this.backgroundColor);
        g.fillRect(0, this.yPos, this.screenWidth, this.yPos + this.lineThickness);
        g.flip();
    },
    
    // Einstellungen
    setEnabled: function(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopVisualization();
            this.clearLine();
        } else {
            this.drawSegmentedLine();
        }
    },
    
    setColor: function(color) {
        this.activeColor = color;
    },
    
    setSegmentColor: function(color) {
        this.segmentColor = color;
        if (this.enabled) {
            this.drawSegmentedLine();
        }
    },
    
    setBackgroundColor: function(color) {
        this.backgroundColor = color;
    },
    
    setThickness: function(thickness) {
        this.lineThickness = thickness;
    },
    
    setPosition: function(yPos) {
        this.clearLine();
        this.yPos = yPos;
    },
    
    setSegments: function(count) {
        this.segments = count;
        if (this.enabled) {
            this.drawSegmentedLine();
        }
    },
    
    setGapWidth: function(gap) {
        this.gapWidth = gap;
        if (this.enabled) {
            this.drawSegmentedLine();
        }
    }
};

// Deine Einstellungen:
/*
CPMVisualizer.init(117, 60, 4, 3);
CPMVisualizer.setEnabled(true);
CPMVisualizer.setColor('#000000');        // Aktive Farbe (schwarz)
CPMVisualizer.setSegmentColor('#ffffff'); // Segment-Farbe (weiß)
CPMVisualizer.setBackgroundColor('#ffffff'); // Hintergrund (weiß)
CPMVisualizer.setThickness(2);
CPMVisualizer.startRealTimeVisualization();
*/   
      
   






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

//------------------------------- neu ------------------------------
// Tägliche Log-Dateien - MIT effizientem Append
var DailyLogger = {
    getFilePrefix: function() {
        var now = new Date();
        var year = now.getFullYear();
        var month = (now.getMonth() + 1).toString().padStart(2, '0');
        var day = now.getDate().toString().padStart(2, '0');
        return "RADIATION_" + year + "-" + month + "-" + day;
    },
    
    getFileName: function() {
        return this.getFilePrefix() + ".csv";
    },
    
    formatTime: function() {
        var now = new Date();
        var hours = now.getHours().toString().padStart(2, '0');
        var minutes = now.getMinutes().toString().padStart(2, '0');
        var seconds = now.getSeconds().toString().padStart(2, '0');
        return hours + ":" + minutes + ":" + seconds;
    },
    
    // KORRIGIERTES Logging
    log: function(cpm) {   
        var filename = this.getFileName();
        var timeStr = this.formatTime();
        var csvLine = timeStr + "," + cpm + "\n";
        
        try {
            var f = require("Storage").open(filename, "a");
            var fileSize = f.getLength();
            
            if (fileSize === 0) {
                
                var header = "time,cpm\n";
                f.write(header + csvLine);
                console.log("Neue Datei:", filename);
                
                return addNewFilenameToList(filename);    //  GLOBAL_FILE_LIST.count wird erhöht ;
                                                          //  GLOBAL_FILE_LIST.files wird erweitert
                                                          //  und abgespeichert
              
            } else {
                f.write(csvLine);
                console.log("Geloggt:", csvLine.trim());
            }
            
            return true;
        } catch (e) {
            console.log("Log Fehler:", e);
            return false;
        }
    },
    
    // Heutige Datei anzeigen
    showToday: function() {
        try {
            var filename = this.getFileName();
            console.log("=== " + filename + " ===");
            
            var f = require("Storage").open(filename, "r");
            var size = f.getLength();
            
            if (size > 0) {
                var content = f.read(size);
                console.log(content);
            } else {
                console.log("Keine Daten vorhanden");
            }
            
        } catch (e) {
            console.log("Fehler:", e);
        }
    }
};



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

function status_zeile_anzeigen(alles_darstellen)
{
 
//  var startTime = Date.now();  // Millisekunden seit 1970

  
  var valueStr;
//--------------------------------------------------------------  
   
//   console.log("Alpha_Stick_RSSI : ", Alpha_Stick_RSSI
  
     //Alpha_Stick_RSSI_merker 
  
//---------------- RSSI anzeigen -----------  
//    if (( Alpha_Stick_RSSI < 0 )  || (alles_darstellen == true ))
// robert   
     
  
    var hysterese = 3;  
  
     if (( Alpha_Stick_RSSI < 0 )  &&  
         (Alpha_Stick_RSSI < ( Alpha_Stick_RSSI_merker - hysterese)) ||  
         (Alpha_Stick_RSSI > ( Alpha_Stick_RSSI_merker + hysterese)) || 
         (alles_darstellen == true ))
     { 
      
    g.clearRect(90, 0 , 131, 21); 
      
 //    g.drawRect(90, 0 , 131, 21);  
      
      
      Alpha_Stick_RSSI_merker = Alpha_Stick_RSSI;
      
      color = BLACK; 
      g.setColor(color);
      g.setFont("Vector", 25);
  
      valueStr = Alpha_Stick_RSSI.toString();
      g.drawString(valueStr, 90, 1);
      
     console.log("%%%%%%%%%%% Alpha_Stick_RSSI : ", Alpha_Stick_RSSI);
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
    
    if (( GMZ_Minuten_zaehler > GMZ_Minuten_zaehler_merker) || (GLOBAL_SETTINGS.keine_grenzwerte === true ))
    {
      
      g.clearRect(17, 0 , 90, 21); 
//      g.drawRect(17, 0 , 90, 21); 
      
      GMZ_Minuten_zaehler_merker = GMZ_Minuten_zaehler;
     
            
      if (color_merker == 1)
      {
        color = RED ;
        color_merker = 0;
      }
      else
      {
        color = BLACK;
        color_merker = 1;
      }
      
      g.setColor(color);
      
      
      g.setFont("Vector", 25);
      valueStr = GMZ_Minuten_zaehler .toString();
      g.drawString(valueStr, 20, 1);
    }
//-----------------------------------------------    
 //  g.flip();
  
//    var endTime = Date.now();
//    var executionTime = endTime - startTime;

//console.log ("Ausführungszeit status_zeile_anzeigen   :", executionTime, "ms");
  
}

//--------------------------------------------------------

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
  
    g.clearRect(0, y+3, 176, 176);     // löscht Bereich  der Uhrzeit  
                                     // Optimierung ? weiße alte Uhrzeit überschreiben ? 
  
//   g.drawRect(0, y+3, 176, 176);     // löscht Bereich  der Uhrzeit  
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


// qwen


function gmz_anzeige ( wert)
{
   
 //  Bangle.loadWidgets();
 
  //Bangle.drawWidgets();
  
  var displayValue = wert ;
  
  
  //console.log("\n  displayValue :",  displayValue );
  
    console.log("\n +++++++++++>  gmz_anzeige : displayValue :",  displayValue );
  
  
  var font_groesse ;
  var x ;
  var y;
  var color; 

  
 // CPMVisualizer.startRealTimeVisualization();
  
  
  
  
  
//vati hier geht es weiter  
  
// nur bei Messwertänderung zeichnen  
//  if (GMZ_Impulse_pro_Minute_Merker !== GMZ_Impulse_pro_Minute)  // hat sich der Wert geändert ?
  {
  
    GMZ_Impulse_pro_Minute_Merker = GMZ_Impulse_pro_Minute ; 
    
    
    g.clearRect(GMZ_Touch_x1,GMZ_Touch_y1,GMZ_Touch_x2,GMZ_Touch_y2); 
    
    //g.drawRect(GMZ_Touch_x1,GMZ_Touch_y1,GMZ_Touch_x2,GMZ_Touch_y2);
                                

  //GMZ_Touch_x1,GMZ_Touch_y1,GMZ_Touch_x2,GMZ_Touch_y2

//    g.drawRect(GMZ_Touch_x1,GMZ_Touch_y1,GMZ_Touch_x2,GMZ_Touch_y2);
  
  //drawTextWithThickOutline("999", 10, 100, 80 , YELLOW);  
  
  
  //var displayValue = Math.max(0, Math.min(999, wert));  // ???
   
//  wert = 1999;
  
 
   
    
    
    
    font_groesse = 90 ;
  
// --------- Farbe bestimmen ----------
   
    
//-------------------------------------------    
   
    
    if (displayValue <= GLOBAL_SETTINGS.GREEN_GRENZWERT) 
    {
        color = GREEN ;
    } 
    else if (displayValue <= GLOBAL_SETTINGS.YELLOW_GRENZWERT ) 
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
      
      if (GLOBAL_SETTINGS.messwert_einheit === GMZ)
      {
         valueStr = displayValue.toString();
        
         stringWidth = g.stringWidth(valueStr);
    
// Perfekt zentriert
         x = (176 - stringWidth) / 2;
    
         y= 25;
      
         if ( font_groesse === 60 )
         {
           y= 40;
         }
         
         drawTextWithThickOutline(wert, x, y,  font_groesse ,color); 
      
      }
      else
      {
        font_groesse = 80 ;
        
        y = 40;
        
        var test_wert = intelligentConversionForDisplay(wert);
        
        if( test_wert > 10)
        {
           font_groesse = 60 ;
        }
        
        if( test_wert > 100)
        {
           font_groesse = 50 ;
        }
        
        // 1. Text-Breite berechnen
        g.setFont("Vector",  font_groesse);
        var textWidth = g.stringWidth(test_wert);
      
        // 2. Display-Breite (176 Pixel)
        var displayWidth = 176;
      
        // 3. Zentrale X-Position berechnen
          x = (displayWidth - textWidth) / 2;
        
         y=y-10;
		     
         x=x+5;
        
        drawTextWithThickOutline(test_wert, x, y,  font_groesse ,color); 
         
     //   g.drawString(test_wert, x , y );      
        
        
      }
      
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
//17_09
 
//         g.setColor(color);
  
// !! gleiche Farbe wie Messwert !!
  
  //    console.log("\n!!!!!!!!!!!!!!!");
  //    console.log(GLOBAL_SETTINGS.messwert_einheit );
 //   console.log(messwert_einheit_merker );
 //     console.log("\n!!!!!!!!!!!!!!!");
    
   if( messwert_einheit_merker !== GLOBAL_SETTINGS.messwert_einheit)    // nur darstellen bei änderung 
   {
     // console.log("\n!!!!HIER !!!!!!!");
      messwert_einheit_merker =  GLOBAL_SETTINGS.messwert_einheit;
     
      //g.clearRect(80, 123-23 , 176, 123); 
//    g.drawRect(80, 123-23 , 176, 123); 
     
      g.clearRect(messwert_einheit_position.x1 ,
               messwert_einheit_position.y1,
               messwert_einheit_position.x2,
               messwert_einheit_position.y2 );    
    
      if (GLOBAL_SETTINGS.messwert_einheit === GMZ)
      {
          g.setFont("Vector", 25);
		 	    g.drawString("cpm", 125, 95);
      }   
      else
      {
         g.setFont("Vector", 25);
  		 	 g.drawString("µSv/h", 97, 100);
   
      }
   }
      
  
  
  }  

  
    status_zeile_anzeigen();
  
 
/*  
  
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

  
//  color = BLACK ; 
//  g.setColor(color);
//  g.setFont("Vector", 25);
//  valueStr =  telegramm_zaehler .toString();
//  g.drawString(valueStr, 20, 3);
  
    
//-------------- Anzahl der Minutenwerte --------   
    color = BLACK ; 
    g.setColor(color);
    g.setFont("Vector", 25);
    valueStr = GMZ_Minuten_zaehler .toString();
    g.drawString(valueStr, 20, 1);
    
//-----------------------------------------------    
  
*/
  
  
}



//--------------------------------------------------------
//23_09
function messwert_anzeige() 
{
    
   var valueStr; 
   var x ;
   var y  ;
   var stringWidth;   
  
  
   g.clear();
    
  
//   Bangle.loadWidgets();
//   Bangle.drawWidgets();
  
  
    console.log("\n----> Alpha_Stick_RSSI :", Alpha_Stick_RSSI);
  
  
//    var displayValue = Math.max(0, Math.min(999, wert));
    
    var displayValue = Math.max(0, Math.min(999, GMZ_Impulse_pro_Minute));
   
//GLOBAL_SETTINGS.GREEN_GRENZWERT
  
    // Farbe bestimmen
    var color;
    if (displayValue <= GLOBAL_SETTINGS.GREEN_GRENZWERT) 
    {
        color = '#00ff00'; // Grün
    } 
    else if (displayValue <=  GLOBAL_SETTINGS.YELLOW_GRENZWERT) 
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
  if (manufacturer_data_header !== 0xFF)        // nur wenn kein Schwerer Fehler aufgetreten ist.
 
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
/*          
           if ( betriebsmodus === GMZ_GROSS ) 
           {
             gmz_anzeige ( GMZ_Impulse_pro_Minute );
      //       status_anzeige_anzeigen();
             // gmz_anzeige ( 9999);
          
           }
*/          
//23_09           
           if ( betriebsmodus === SERVICE ) 
           {
             //messwert_anzeige();
           }
     
          
//            messwert_anzeige() ;
          
          
          
          
            console.log("\n->  ********GMZ_Impulse_pro_Minute: ", GMZ_Impulse_pro_Minute, "*******"); 
        
          
// luise       
          
            if (anzahl_advertising_telegramme == 0)               // das erste Telegramm nach Kaltstart ist gekommen  
            {
          
              
              if ( betriebsmodus === GMZ_GROSS ) 
              {
                gmz_anzeige ( GMZ_Impulse_pro_Minute );
                status_zeile_anzeigen(true);
                
                 
               
                if ( GLOBAL_SETTINGS.warte_linie === true )
                {
                //CPMVisualizer.stopVisualization();      
                   CPMVisualizer.startRealTimeVisualization();
                }
                
              }
              
              
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
              
              
              
              if (TEST_BIT(manufacturer_data_header,GMZ_MINUTE_FLAG) !== GMZ_MINUTE_FLAG_merker ) // wenn sich Flag geändert, dann neuer Minuten Wert vorhanden
              {       

 //               console.log("\n****** HIER *******\n");
                
                
                GMZ_MINUTE_FLAG_merker = TEST_BIT(manufacturer_data_header,GMZ_MINUTE_FLAG);   // Flag merkern 0 oder 32 wenn gesetzt !                
                
                GMZ_Impulse_pro_Minute_neu_flag = 1;

                mess_data_GMZ_Impulse_pro_Minute_neu_flag = GMZ_Impulse_pro_Minute_neu_flag;



                
                GMZ_Minuten_zaehler++;                 // jede Minute ein neuer Messwert
// 5_9                 
                
               if ( betriebsmodus === GMZ_GROSS ) 
               {
                 gmz_anzeige ( GMZ_Impulse_pro_Minute );
                
               }
                
                else
                {
                  
                  messwert_anzeige();
                }
                
                if ( GLOBAL_SETTINGS.warte_linie === true )
                {
                
                   CPMVisualizer.stopVisualization();      
                   CPMVisualizer.startRealTimeVisualization();
                }
                
                         
                console.log("\n--------->GMZ_Minuten_zaehler: ", GMZ_Minuten_zaehler   ); 
                
               // console.log("\ Messdaten werden gespeichert"); 
 
//vati           
 console.log("\n GLOBAL_SETTINGS.keine_grenzwerte",GLOBAL_SETTINGS.keine_grenzwerte); 
 

                if ( (GMZ_Impulse_pro_Minute > GLOBAL_SETTINGS.GREEN_GRENZWERT ) || (GLOBAL_SETTINGS.keine_grenzwerte === true))
                {
                  
                   console.log("\n HURRA Messdaten werden gespeichert"); 
                  
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

//------



//---------------------------------------------------------------


//------------------ Taste Abfrage --------------  ---
//  datei_liste ();  

//require("Storage").erase("RADIATION_2025-08-31.csv");  // löscht Datein
//require("Storage").erase("RADIATION_2025-08-31.csv\u0001");  // löscht Datein

/*
                                      // zeigt alle Datein an
require("Storage").erase("RADIATION_2025-08-23.csv");  // löscht Datein
require("Storage").erase("RADIATION_2025-08-24.csv");
datei_liste ();
*/

//datei_liste ();


//console.log("\nVerfügbare Log-Dateien:", DailyLogger.listLogFiles());

//console.log("\nVerfügbare Log-Dateien:", DailyLogger.readToday());

console.log("\nIDE Connected:", isIDEConnected() );



g.clear();

// RADIATION_LIST.txt
//  dauert zu lang !!! 3 s     var anzahl= populateFileList();
//       console.log("--***--->Gefundene Dateien:", anzahl );
// test      anzahl =0;
      
     // if (  GLOBAL_FILE_LIST.count > 0 )   // nur wenn auch LOG Datein vorhanden sind !!
      //{


//vati

//var test_interval = setInterval(function() {
//    console.log("===>> START TEST <<===");
//}, 500);




 var startTime = Date.now();

// wenn nur RADIATION_LIST.txt geladen wird dauert es 25 ms 
// wenn RADIATION_LIST.txt erzeugt werden muss, dauert es 3197 ms !! 

var filename =  GLOBAL_FILE_LIST.dateiname;

setTimeout(function() {
 var rueckwert = radiation_file_list(filename);
		
    if (rueckwert === false)
		{
		   console.log("Datei nicht vorhanden :", filename);
		}
		else
		{
		   console.log("Datei erfolgreich wird erzeugt:", filename);
		}
}, 1000);


//-------

var rueck_wert = radiation_setting_laden(); 

if ( rueck_wert === false)
{
  console.log(" Default Settings werden verwendet ");
}





//-------

var endTime = Date.now();
var executionTime = endTime - startTime;

console.log("--->RADIATION_LIST.txt  Ausführungszeit:", executionTime, "ms");
  
  
// clearInterval( test_interval );





Bangle.loadWidgets();      // muss nur einmal geladen werden 
Bangle.drawWidgets();      // 

Bangle.setOptions({wakeOnBTN1 : true});

Bangle.setLCDBrightness(0);

betriebsmodus = GMZ_GROSS ;




//betriebsmodus = SERVICE;
//vati
  
// --> dauert 3s populateFileList();



//console.log(">>>>>>>>>>>>>Gefundene Dateien:", GLOBAL_FILE_LIST.count);







//**********************


//require("Storage").erase("RADIATION_2025-09-04.csv");
//require("Storage").erase("RADIATION_2025-09-03.csv");
//require("Storage").erase("RADIATION_2025-09-02.csv");
//datei_liste ();


//vati
//DailyLogger.showToday();

//DailyLogger.getFileSize


//console.log("Dateilänge :",DailyLogger.getFileSize  ,"Bytes ");



// Beispiel-Verwendung:


// Beispiel-Verwendung:
//17_09
CPMVisualizer.init(124, 60, 4, 3);
CPMVisualizer.setEnabled(true);
CPMVisualizer.setColor('#000000');        // Aktive Farbe (schwarz)
CPMVisualizer.setSegmentColor('#ffffff'); // Segment-Farbe (weiß)
CPMVisualizer.setBackgroundColor('#ffffff'); // Hintergrund (weiß)
CPMVisualizer.setThickness(1);
//CPMVisualizer.startRealTimeVisualization();
  

// Stoppen (wenn nötig)
// CPMVisualizer.stopVisualization();



//Bangle.setOptions({backlightTimeout: 5000}) ;// turn off the timeout
//Bangle.setOptions({lockTimeout: 5000}) ;// turn off the timeout


Bangle.setOptions({backlightTimeout:GLOBAL_SETTINGS.backlightTimeout*1000}) ;// turn off the timeout
Bangle.setOptions({lockTimeout:GLOBAL_SETTINGS.lockTimeout*1000}) ;// turn off the timeout





// In deiner Messwert-Darstellungs-App:
function exitToAuswertung() {
    try {
        console.log("=== VERLASSE Messwert-App ===");
        
        // Aufräumen
        Bangle.removeAllListeners('swipe');
        Bangle.removeAllListeners('touch');
        g.clear();
        
        // Direkt zur Auswertungs-App
        
		radiation_settings_abspeichern();
		
		load("rad_analyse.app.js"); // Deine Auswertungs-App
        
    } catch (e) {
        console.log("Fehler beim Wechsel:", e.message);
        Bangle.showLauncher(); // Fallback
    }
}

//vati
Bangle.on('swipe', function(directionLR, directionUD) {
    if (directionLR === 1) {
        
//  dauert zu lang !!! 3 s     var anzahl= populateFileList();
//       console.log("--***--->Gefundene Dateien:", anzahl );
// test      anzahl =0;
      
     // if (  GLOBAL_FILE_LIST.count > 0 )   // nur wenn auch LOG Datein vorhanden sind !!
      //{
      // LINKS-NACH-RECHTS = Zur Auswertung
        console.log("Wechsel zur Auswertungs-App");
        exitToAuswertung();
        
     // }
        return;
    }
    
  
  
  
  
  
    // Rest deiner Swipe-Logik...
});




E.on('kill', function()    // wird noch aufgerufen, wenn APP abgebrochen wurde
{
  radiation_settings_abspeichern();
  console.log("Bye!");
});

//**********************



setWatch(function(f) {
   
  button_click_zaehler ++;
  
  console.log("Pressed");
  status_zeile_anzeigen();
  
    
  if (button_click_zaehler ===1 )
  {
    Bangle.setOptions({btnLoadTimeout : 3000});
    Bangle.setLCDBrightness(1);
  }
  else
  {
  
    Bangle.setOptions({btnLoadTimeout : 3000});
    Bangle.setLCDBrightness(0);
    button_click_zaehler = 0; 
  }
  

  
}, BTN, {edge:"rising", debounce:50, repeat:true});
//-----------------------------------------------------



//23_09





  Bangle.on('swipe', function(directionLR, directionUD) {
            //console.log("=== SWIPE erkannt ===");
            console.log("LR:", directionLR, "UD:", directionUD);
  
  if(directionLR ===0 && directionUD ===1)
  {
     console.log("===SWIPE Oben nach Unten erkannt ===");
     
     Bangle.buzz(50);
     
     if ( GLOBAL_SETTINGS.warte_linie === true )
     {
        GLOBAL_SETTINGS.warte_linie = false;
        CPMVisualizer.stopVisualization();   
        CPMVisualizer.clearLine();
       GLOBAL_SETTINGS.keine_grenzwerte = false;
       
        //CPMVisualizer.startRealTimeVisualization();
      }
      else
      {
        
        GLOBAL_SETTINGS.warte_linie = true ;
        CPMVisualizer.stopVisualization();      
        CPMVisualizer.startRealTimeVisualization();
            
        GLOBAL_SETTINGS.keine_grenzwerte = true;
      }
    
  }


  });







Bangle.on('backlight', function(on) 
{ 
 console.log(" *** LICHT AN *** ");
// status_zeile_anzeigen(); 

});

 
//-------  

/*
Bangle.on('lock' , function (off,reason) 
{   

 console.log(" *** LOCK OFF *** ");
 status_zeile_anzeigen(); 

});

*/

// Beste Lösung: Lock/Unlock Events

/*
    Bangle.on('lock', function(isLocked) {
        if (!isLocked) {
             console.log(" *** LOCK OFF *** ");
          // Gerade entsperrt - Statuszeile wiederherstellen
            setTimeout(function() {
            status_zeile_anzeigen();
            }, 1); // Kurze Pause für Widget-Animation
        }
    });
*/


// Bessere Lösung mit backlight Event
Bangle.on('lock', function(isLocked) {
    if (!isLocked) {
        console.log(" *** LOCK OFF *** ");
        // Beim Entsperren 
      
        Bangle.setLCDBrightness(0);
      
        setTimeout(function() {
            status_zeile_anzeigen();
        }, 250);
    } else {
        console.log(" *** LOCK ON *** ");
        // Beim Sperren
        setTimeout(function() {
            status_zeile_anzeigen(true);
        }, 50);
    }
});

// Backlight Event für Display-Änderungen
Bangle.on('backlight', function(backlightOn) {
    console.log("Backlight:", backlightOn);
    // Kurze Verzögerung für Widget-Stabilisierung
    setTimeout(function() {
        status_zeile_anzeigen(true);
    }, 50);
});


//------
  
 Bangle.on('touch', function(button, xy) {
    console.log("Touch:", xy.x, xy.y); 
     
 //  if ( xy.x > 0  && xy.y < GMZ_Touch_y2 && xy.y > GMZ_Touch_y1 )    // einheiten umschalten 

   

   
   if ( xy.x >  messwert_einheit_position.x1 &&   // einheiten umschalten auf Einheiten tippen
        xy.y >  messwert_einheit_position.y1 && 
	      xy.x <  messwert_einheit_position.x2 &&
	      xy.y <  messwert_einheit_position.y2     )   
    
   {
      console.log("*******>>>>> Einheit getroffen!");
/*     
         g.drawRect(messwert_einheit_position.x1 ,
               messwert_einheit_position.y1,
               messwert_einheit_position.x2,
               messwert_einheit_position.y2 );
*/
     
     
     
     
      if (( Scanning === true) && (betriebsmodus === GMZ_GROSS) )    // nur wenn Scanning noch aktiv und GMZ Anzeige
      {
     
        if ( GLOBAL_SETTINGS.messwert_einheit === uSv)
        {
           GLOBAL_SETTINGS.messwert_einheit = GMZ;
           messwert_einheit_merker = uSv;               //  damit die Einheit gleich dargestellt wird

        }
        else
        {
           GLOBAL_SETTINGS.messwert_einheit = uSv;
           messwert_einheit_merker = GMZ;               // damit die Einheit gleich dargestellt wird
        }

          gmz_anzeige ( GMZ_Impulse_pro_Minute );
        
      }
   }

   
   
   
   
     
   else if ( xy.x > 0  && xy.y > 150 &&  xy.x < 80)     //  Umschalten ins  Service Menue jatzt auf Uhrzeit tapen 
     
   {

      console.log("-------->links oben ");
      Bangle.buzz(50);
     
//      betriebsmodus++ ; 
     
     if (betriebsmodus === GMZ_GROSS)
     {
        betriebsmodus = SERVICE;      
     }
     else
     {
       betriebsmodus = GMZ_GROSS;
     }
     
     
     
     
      
      if ( Scanning === true )    // nur wenn Scanning noch aktiv, dann umschalten 
      {
     
        if (betriebsmodus === SERVICE) 
        {
          CPMVisualizer.stopVisualization();  
          g.clear();
          menue_anzeigen("SCAN",GREEN);
          clearInterval( Uhrzeit_Timer_1 );
          
        }
        else
        {
          g.clear();
          menue_anzeigen("SCAN",GREEN);
         // betriebsmodus = GMZ_GROSS ;
          Uhrzeit_Timer_1 = setInterval(function() {uhrzeit_darstellen( 10 , 114 , 60);}, 1000);
        }
     
      }
      else
      {
        Scan_Versuche = Max_Anzahl_Scan_Versuche ;
        startScan();      
      }
    
     
     
//      if (betriebsmodus === ENDE)
//      {
//        betriebsmodus = 0;
//      }     
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

     Uhrzeit_Timer_1 = setInterval(function() {uhrzeit_darstellen( 10 , 114 , 60);}, 1000);
  
  }

Scan_Versuche = Max_Anzahl_Scan_Versuche ;

menue_anzeigen("SCAN",GREEN);


setTimeout(function() {

startScan(); 

  
}, 1000);





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















