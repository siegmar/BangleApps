/*******************************************************************************







*******************************************************************************/

// KOMPLETTE LOG-ANZEIGE - MIT DEINER ORIGINAL-SCROLL-LOGIK

const BLACK  =  '#000000' ;
const GREEN  =  '#00ff00' ;
const YELLOW =  '#ffff00' ;
const RED    =  '#ff0000' ;
const BLUE   =  '#0000ff' ; 
const WHITE  =  '#ffffff' ;


const  GMZ = 0;
const  uSv = 1;

//var messwert_einheit = GMZ;
//var messwert_einheit = uSv;
var alert_vorhanden  = false;

var countdown_timer_init = 60;

var countdown_timer =  countdown_timer_init ;   // nach 60 s ohne Aktivität wird die APP abgebrochen 
                                                // wegen Stromersparnis 
var button_click_zaehler = 0;

var content;    // enthält csv Datei mit Header

var gespeicherte_messwerte = [];



// === DATEI-LISTE FÜR NAVIGATION ===

// GLOBALE VARIABLE für Datei-Liste
var GLOBAL_FILE_LIST = {
    files: [],                      // Sortierte Dateinamen
    count: 0,                       // Anzahl Dateien
    busy_flag: false,
    index:0,                        // Index der aktuellen Logdatei
    dateiname:"RADIATION_LIST.txt"  // hier stehen die Dateinamen der gespeicherten Log Datein
};



// === GLOBALE EINSTELLUNGEN ===
var GLOBAL_SETTINGS = {
    GREEN_GRENZWERT: 30,
    YELLOW_GRENZWERT: 50,
	messwert_einheit: GMZ,
    
    FONT_SIZES: {
        title: 16,
        subtitle: 18,
        header: 18,
        messwerte:24,
        info: 14,
        small: 12
    },
    
    // FESTER ABSTAND zwischen den Zeilen
    LINE_SPACING: 24,
    
    // ALERT-EINSTELLUNGEN - VOLL KONFIGURIERBAR!
    ALERT_SETTINGS: {
        grenzwert: 35,       // Dein Grenzwert
        rectWidth: 6,         // Rechteck-Breite
        rectHeight: 6,        // Rechteck-Höhe
        rectColor: '#ff0000', // Rot
        posX: 1,              // X-Position (LINKER Rand)
        posY: 5               // Y-Offset (relativ zur Zeile)
    }
};


function test_log_datei_schreiben()
{   
    var filename = "RADIATION_2025-10-01.csv";

		var zeile ="time,cpm\n";
		
		var f = require("Storage").open(filename, "a");
		
    f.write(zeile);
		
		for( var i=0 ; i < 1440  ; i++)
		{
		  zeile ="00:59,999\n";
		  f.write(zeile);
		}
	   
	      console.log("LOG Daten ein ganzer Tag geschrieben" );
                	
}
		
		


//---
// === ROUTINE ZUM UMKEHREN DER LOG-REIHENFOLGE ===
function reverseLogContent(content) {
    try {
        console.log("=== KEHRE LOG-REIHENFOLGE UM ===");
        
        // Inhalt in Zeilen aufteilen
        var lines = content.split('\n').filter(line => line.trim() !== "");
        
        if (lines.length === 0) {
            console.log("? Leere Log-Datei");
            return content; // Original zurückgeben
        }
        
        console.log("Gefundene Zeilen:", lines.length);
        
        // Header trennen (erste Zeile)
        var header = lines[0];
        var dataLines = lines.slice(1);
        
        console.log("Datenzeilen:", dataLines.length);
        
        // Datenzeilen umkehren (neueste zuerst)
        dataLines.reverse();
        
        // Header + umgekehrte Datenzeilen zusammenfügen
        var reversedLines = [header].concat(dataLines);
        
        // Zurück in einen String
        var reversedContent = reversedLines.join('\n');
        
        console.log("? Log-Reihenfolge umgekehrt!");
        console.log("Erste Zeile:", reversedLines[1]);  // Neueste Messung
        console.log("Letzte Zeile:", reversedLines[reversedLines.length - 1]); // Älteste Messung
        
        return reversedContent;
        
    } catch (e) {
        console.log("? Fehler beim Umkehren:", e.message);
        return content; // Bei Fehler Original zurückgeben
    }
}


//---


function radiation_settings_abspeichern()
 {
    try {
        console.log("=== ÜBERGEBE PARAMETER ÜBER SETTINGS ===");
        
        // Settings speichern
        var settings = {
			messwert_einheit: GLOBAL_SETTINGS.messwert_einheit,
            GREEN_GRENZWERT: GLOBAL_SETTINGS.GREEN_GRENZWERT,
            YELLOW_GRENZWERT: GLOBAL_SETTINGS.YELLOW_GRENZWERT
        };
        
        require("Storage").write("radiation_settings.json", JSON.stringify(settings));
        console.log("? Settings gespeichert");
        
           } catch (e) {
        console.log("? Fehler bei Settings:", e.message);
    }
}

//-----------

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
			      GLOBAL_SETTINGS.GREEN_GRENZWERT  = settings.GREEN_GRENZWERT;
			      GLOBAL_SETTINGS.YELLOW_GRENZWERT = settings.YELLOW_GRENZWERT;
			
			
            return true;
        } 
     } catch (e) 
	   {
        console.log("? Settings-Fehler:", e.message);
     }
    return false;

}






//----------------------------------------------------------------------



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

// === AUSRÜCKEN DER LISTE ===
function removeFromGlobalFileList(filenameToDelete) {
    try {
        console.log("=== LISTE AUSRÜCKEN ===");
        console.log("Vorher:", GLOBAL_FILE_LIST.files.length, "Dateien");
        console.log("Lösche:", filenameToDelete);
        
        // 1. DATEI aus Liste entfernen
        var newList = [];
        var removedCount = 0;
        
        for (var i = 0; i < GLOBAL_FILE_LIST.files.length; i++) {
            var currentFile = GLOBAL_FILE_LIST.files[i];
            if (currentFile !== filenameToDelete) {
                newList.push(currentFile);
            } else {
                removedCount++;
                console.log("✅ Datei aus Liste entfernt:", currentFile);
            }
        }
        
        // 2. GLOBALE Liste aktualisieren
        GLOBAL_FILE_LIST.files = newList;
        GLOBAL_FILE_LIST.count = newList.length;
        
        console.log("Nachher:", GLOBAL_FILE_LIST.count, "Dateien");
        console.log("Entfernt:", removedCount, "Einträge");
        
        if (removedCount > 0) {
            console.log("✅ Liste erfolgreich aufgerückt!");
            return true;
        } else {
            console.log("ℹ️ Datei nicht in Liste gefunden");
            return false;
        }
        
    } catch (e) {
        console.log("❌ Fehler beim Aufrücken:", e.message);
        return false;
    }
}

//-----------------

function saveFileList(filename) {
    try {
        console.log("=== SPEICHERE DATEILISTE ===");
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



//-----------------
function logDatei_loeschen(dateiname)
{
  
 require("Storage").open(dateiname,"r").erase(); 
  
  removeFromGlobalFileList(dateiname);                               // Log Datei Name aus der Liste entfernen und  
                                                                     // Liste neu aufbauen d.h Lücken schließen
  
  require("Storage").open(GLOBAL_FILE_LIST.dateiname,"r").erase();   // GLOBAL_FILE_LIST löschen 
   
  if (GLOBAL_FILE_LIST.files.length > 0 )                            // nur speichern, wenn Liste nicht leer ist
  
  
  if ( GLOBAL_FILE_LIST.count > 0)
  {
     saveFileList(GLOBAL_FILE_LIST.dateiname);                          // neue Liste Speichern
  }
/*  
  for(var i=0; i<  GLOBAL_FILE_LIST.count ; i++)
  {
    console.log(GLOBAL_FILE_LIST.files[i], "\n");                   // zeigt die Liste an
  }  
*/
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




// === ROUTINE 1: Dateinamen in Liste eintragen (neueste oben) ===
function populateFileList() {
    try {
        console.log("=== POPULATE FILE LIST ===");
        
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
        radiationFiles.sort().reverse();
        
        // Globale Liste füllen
        GLOBAL_FILE_LIST.files = radiationFiles;
        GLOBAL_FILE_LIST.count = radiationFiles.length;
        
        console.log("Gefundene Dateien:", GLOBAL_FILE_LIST.count);
        return GLOBAL_FILE_LIST.count;
        
    } catch (e) {
        console.log("Fehler beim Populate:", e.message);
        GLOBAL_FILE_LIST.files = [];  // ✅ IN SCOPE!
        GLOBAL_FILE_LIST.count = 0;   // ✅ IN SCOPE!
        return 0;
    }
}

// === ROUTINE 2: Dateiname durch Index abrufen ===
function getFilenameByIndex(index) {
    try {
        console.log("=== GET FILENAME BY INDEX ===");
        console.log("Index:", index, "Max:", GLOBAL_FILE_LIST.count - 1);
        
        if (index >= 0 && index < GLOBAL_FILE_LIST.count) {
            var filename = GLOBAL_FILE_LIST.files[index];
            console.log("Gefundener Dateiname:", filename);
            return filename;
        } else {
            console.log("Index außerhalb Bereich:", index);
            return null;
        }
        
    } catch (e) {
        console.log("Fehler beim Get Filename:", e.message);
        return null;
    }
}

// === TEST DER ROUTINEN ===
function testFileNavigation() {
    console.log("=== TEST DATEI-NAVIGATION ===");
    
    // Liste füllen
    var fileCount = populateFileList();
    console.log("Anzahl Dateien:", fileCount);
    
    // Erste 3 Dateien anzeigen
    for (var i = 0; i < Math.min(3, fileCount); i++) {
        var filename = getFilenameByIndex(i);
        if (filename) {
            console.log("Datei " + i + ":", filename);
        }
    }
    
    // Letzte Datei anzeigen
    if (fileCount > 0) {
        var lastFilename = getFilenameByIndex(fileCount - 1);
        console.log("Letzte Datei:", lastFilename);
    }
}




// === HEUTIGE LOG-DATEI PRÜFEN OHNE BEREINIGUNG ===
function checkTodaysLogFileExists() {
    try {
        // Heutiges Datum im Format YYYY-MM-DD
        var today = new Date();
        var year = today.getFullYear();
        var month = (today.getMonth() + 1).toString().padStart(2, '0');
        var day = today.getDate().toString().padStart(2, '0');
        
        // Dateiname für heute
        var todaysFilename = "RADIATION_" + year + "-" + month + "-" + day + ".csv";
        console.log("Prüfe heutige Datei:", todaysFilename);
        
        // DIREKT PRÜFEN ob Datei existiert
        var f = require("Storage").open(todaysFilename, "r");
        var fileSize = f.getLength();
        
        if (fileSize > 0) {
            console.log("Heutige Datei existiert! Groessee:", fileSize, "Bytes");
            return todaysFilename;
        } else {
            console.log("Heutige Datei existiert nicht oder ist leer");
            return null;
        }
        
    } catch (e) {
        console.log("Heutige Datei nicht gefunden:", e.message);
        return null;
    }
}

//---------------------------------------------------------------------------

// === STRING-PARSING FÜR ZEIT UND CPM ===

function extractTimeAndCPM(text) {
    try {
        // Text trimmen (Leerzeichen am Anfang/Ende entfernen)
        var trimmedText = text.trim();
        
        // Text an LEERZEICHEN trennen
        var parts = trimmedText.split(/\s+/); // Mehrere Leerzeichen als Trenner
        
        if (parts.length >= 2) {
            var timeStr = parts[0];  // Erstes Element = Zeit
            var cpmStr = parts[1];   // Zweites Element = CPM
            
            // CPM in Integer umwandeln
            var cpmInt = parseInt(cpmStr) || 0;
            
            //console.log("Zeit:", timeStr);
            //console.log("CPM:", cpmInt);
            
            return {
                time: timeStr,    // "23:00"
                cpm: cpmInt       // 34 (als Integer)
            };
        }
    } catch (e) {
        console.log("Parsing Fehler:", e);
    }
    
    // Fallback
    return {
        time: "00:00",
        cpm: 0
    };
}

//------------------------

function hasAlertValues_neu(dataLines) {
    try {
        // Jede Zeile prüfen
        for (var i = 0; i < dataLines.length; i++) {
          
          var line = dataLines[i];  
          var cpmPart = dataLines[i].slice(6);
          var cpmValue = parseInt(cpmPart) || 0;
          
          if (cpmValue > GLOBAL_SETTINGS.ALERT_SETTINGS.grenzwert) 
          {
            return true; // SOFORTIGE Rückgabe bei erstem Alert!
          }

        }
        
        // Keine Alert-Werte gefunden
        return false;
        
    } catch (e) {
        // Bei Fehler: Keine Alert-Werte annehmen
        return false;
    }
}



//---------
function hasAlertValues(dataLines) {
    try {
        // Jede Zeile prüfen
        for (var i = 0; i < dataLines.length; i++) {
            var line = dataLines[i];
            
            // Zeile parsen
            var parts = line.split(',');
            if (parts.length >= 2) {
                var cpmPart = parts[1].trim();
                var cpmValue = parseInt(cpmPart) || 0;
                
                // Prüfen ob Grenzwert überschritten
                if (cpmValue > GLOBAL_SETTINGS.ALERT_SETTINGS.grenzwert) {
                    return true; // SOFORTIGE Rückgabe bei erstem Alert!
                }
            }
        }
        
        // Keine Alert-Werte gefunden
        return false;
        
    } catch (e) {
        // Bei Fehler: Keine Alert-Werte annehmen
        return false;
    }
}

//----------------------------------------------------------

var CustomScrollView_neu = {
    items: [],
    currentIndex: 0,
    fontSize: 24,
    lineHeight: 24,
    visibleLines: 7,
    startY: 0,
    fixedDate: "",
 //   busy_flag: false,
    measurementCount: 0,
    
    // Initialisierung
    init: function(title, dataLines) {
        console.log("neu === DEINE ORIGINAL-LOGIK Init ===");
       // this.busy_flag = false;
        this.items = [];
        this.currentIndex = 0;
        this.fixedDate = title;
        this.measurementCount = dataLines.length;
        
      
//       var startTime = Date.now();
      
// dauert 9,56 s       
/*        
      // Datenzeilen MIT Alerts
        for (var i = 0; i < dataLines.length; i++) {
            var processedLine = this.processLineWithAlert(dataLines[i]);
            this.items.push({
                //type: "data",
                t: processedLine.text
                //fontSize: GLOBAL_SETTINGS.FONT_SIZES.messwerte,
                //alert: processedLine.alert      // Alert-Flag hinzugefügt!
            });
        }
*/        
      
/*      
       var endTime = Date.now();
       var executionTime = endTime - startTime;
      executionTime = executionTime.toFixed(0);
      console.log("++++++++++this.items.push(",executionTime, "ms");   
*/      
      
      
        // LEERZEILEN hinzufügen für volle Seiten
        var itemsPerPage = 5; // 5 Datenzeilen pro Seite
        var remainder = dataLines.length % itemsPerPage;
        
        if (remainder !== 0) {
            var emptyLinesNeeded = itemsPerPage - remainder;
            for (var j = 0; j < emptyLinesNeeded; j++) {
              
              dataLines.push("");   // Leerzeilen anhängen
            /*
                this.items.push({
                    //type: "empty",
                    t: ""  // Leere Zeile
                    //fontSize: GLOBAL_SETTINGS.FONT_SIZES.small,
                    //alert: false  // Kein Alert bei Leerzeilen
                });
            */
            }
            console.log("neu Leerzeilen hinzugefügt:", emptyLinesNeeded);
        }
        
        console.log("neu Gesamt Items:", dataLines.length);
        
        this.display(dataLines);
      
      
//      console.log(this.items);
      
      
      
        this.setupSwipeScrolling(dataLines);
    },
    
    // LINIE MIT Alert-Information verarbeiten
    processLineWithAlert: function(line) {
        try {
            var parts = line.split(',');
            
            if (parts.length >= 2) {
                var timePart = parts[0].trim();
                var cpmPart = parts[1].trim();
                var cpmValue = parseInt(cpmPart) || 0;
                
                // Alert prüfen
                var hasAlert = cpmValue > GLOBAL_SETTINGS.ALERT_SETTINGS.grenzwert;
                
                if (timePart && timePart.includes(':')) {
                    var timeComponents = timePart.split(':');
                    
                    // HH:MM:SS -> HH:MM
                    if (timeComponents.length === 3) {
                        var timeWithoutSeconds = timeComponents[0] + ":" + timeComponents[1];
                        return {
                            text: timeWithoutSeconds + "   " + cpmPart,
                            alert: hasAlert  // Alert-Flag setzen
                        };
                    }
                    // HH:MM -> bleibt
                    else if (timeComponents.length === 2) {
                        return {
                            text: timePart + "   " + cpmPart,
                            alert: hasAlert  // Alert-Flag setzen
                        };
                    }
                    // Andere -> Standard
                    else {
                        return {
                            text: timePart + "   " + cpmPart,
                            alert: hasAlert  // Alert-Flag setzen
                        };
                    }
                }
            }
        } catch (e) {
            // ignore
        }
        
        return {
            text: line,
            alert: false  // Kein Alert bei Fehler
        };
    },
    
    // Anzeige MIT Alerts
    display: function(dataLines) {
        console.log("neu === DEINE ORIGINAL-ANZEIGE MIT ALERTS ===");
        console.log("neu Aktueller Index:", this.currentIndex);
        
        g.clear();
        g.setColor('#ffffff');
        g.fillRect(0, 0, 176, 176);
        g.setColor('#000000');
        
        // ERSTE ZEILE: Datum + Fortschritt
        var totalItems = this.measurementCount;
        var currentItem = this.currentIndex + 1;
        var progressLine = this.fixedDate + " (" + currentItem + "/" + totalItems + ")";
        
        g.setFont("Vector", GLOBAL_SETTINGS.FONT_SIZES.title);
       
// vati      
        g.drawString(progressLine, 10, 5);   // zeichnet die erste Zeile, hier muß das rote Rechteckgesetzt werden
       
     // alert_vorhanden = false;
/*
      
      if (alert_vorhanden === true)
        {
         
          g.setColor(GLOBAL_SETTINGS.ALERT_SETTINGS.rectColor);
          g.fillRect( 1,8, 1 + GLOBAL_SETTINGS.ALERT_SETTINGS.rectWidth,   // Breite
                           8 + GLOBAL_SETTINGS.ALERT_SETTINGS.rectHeight); // Höhe
          g.setColor('#000000');                                           // Zurück zu Schwarz         
        }
*/ 
      
//---      
         
      if (alert_vorhanden === true)
        {
           g.setColor(RED); 
      
        }
        else
        {
            g.setColor(BLACK); 
        }
          

          g.drawLine(0, 25, 176, 25);     // Trennlinie  
          g.drawLine(0, 25+1, 176, 25+1);     // Trennlinie  
          
          g.setColor(BLACK); 
      
//---      
      
        // Überschrift
        g.setFont("Vector", GLOBAL_SETTINGS.FONT_SIZES.header);
        
      
      
        //g.drawString("  Zeit  CPM  µSv/h", 10, 35);
      
      
        if (GLOBAL_SETTINGS.messwert_einheit === GMZ)
        {
          g.drawString("  Zeit     CPM  ", 10, 35);
        }
        else
        {
          g.drawString("  Zeit    µSv/h", 10, 35);
        }
       
      
      
        // DATENZEILEN MIT Alerts
        var startY = 60;
        var itemsPerPage = 5; // 5 Zeilen pro Seite
        console.log("neu Zeige", itemsPerPage, "Zeilen");
        
        for (var i = 0; i < itemsPerPage; i++) {
            var itemIndex = this.currentIndex + i;
            if (itemIndex < dataLines.length) {
                var item =  dataLines [itemIndex];
               
   //           console.log(item);
   //           console.log(content[1],content[2],content[3],content[4]);
              
              
              
              
                var y = startY + (i * GLOBAL_SETTINGS.LINE_SPACING);
                
                //g.setFont("Vector", item.fontSize);
				
				g.setFont("Vector", GLOBAL_SETTINGS.FONT_SIZES.messwerte);
				
				
                if (item !== "") {  // Nur nicht-leere Zeilen anzeigen                 
         
//                console.log(item.t+ "\n");  
//01_10                 
               //  var result = extractTimeAndCPM(item.t);
//               console.log("Ergebnis:", JSON.stringify(result));
                 //var cpm  =   result.cpm ;  
                
              //    console.log("G_S.m_einheit:",GLOBAL_SETTINGS.messwert_einheit + "\n"); 
                  
                 
               var zeit = item.slice(0,5);
               
               var cpmStr = item .slice(6);
               var cpm = parseInt(cpmStr) || 0;
                  
                  
               console.log("neu",zeit ," ",cpm);                     
                  
                  
                  var uSv_wert;
            
                 if (GLOBAL_SETTINGS.messwert_einheit === uSv) 
                 { 
                   //uSv_wert = 0.20;
                   
                   
                   
                   uSv_wert= intelligentConversionForDisplay(cpm);
                   
                 }
                  
                  
                
//                 var zeit =   result.time ;                        
                
                  
                var x=10;
                
               g.drawString(zeit, x, y);
                  
                  x = 140;
    
//********************* TEST Formatierung testen ***********************                  
                  
                  
/*                  
                  
                if (i===1)
                {
                
                  cpm=999;
                }
                 
                  if (i===2)
                {
                
                  cpm=9999;
                }
                 
                  if (i===4)
                {
                
                  cpm=99999;
                }
                  
*/                  
                  
                 var zeile = zeit+"    "+cpm;   // 2 stellige Anzeige
                 
                 if (cpm > 99 && cpm < 1000)
                 {
                   x= x- 16;
                   zeile = zeit+"   "+cpm;     // 3 stellige Anzeige
                 }
                 else if (cpm > 999 && cpm < 10000)
                 {
                    x= x-32;
                    zeile = zeit+"  "+cpm;     // 4 stellige Anzeige
             
                 }
                 else if ( cpm>9999 && cpm < 100000)
                 {
                   x=x-45;
                 
                 }
                  
                  if (cpm >35)
                  {
                  
                  g.setColor('#ff0000');
                  }
                  
                  if (GLOBAL_SETTINGS.messwert_einheit === uSv)  
                  {
                     
                    
                    
                    x=x-30;
                    
                    
                    
                    g.drawString(uSv_wert, x, y);
                  }
                  else
                  {
                    g.drawString(cpm, x, y);
                  }
                
                  
                  g.setColor('#000000');
                  
                  
//                g.drawString(item.t, 10, y);
               
                  //g.drawString(zeile, 10, y);
                 
//                  console.log(zeile + "\n");  
                  
             //    console.log(item.t+ "\n");                 
               
                  
                }
                
                // ALERT-RECHTECK zeichnen wenn nötig
/*
                if (item.alert === true) {
                    g.setColor(GLOBAL_SETTINGS.ALERT_SETTINGS.rectColor);
                    
                    // KONFIGURIERBARE Position:
                    var rectX = GLOBAL_SETTINGS.ALERT_SETTINGS.posX;  // LINKER Rand
                    var rectY = y + GLOBAL_SETTINGS.ALERT_SETTINGS.posY; // Mitte der Zeile
                    
                    g.fillRect(
                        rectX, 
                        rectY,
                        rectX + GLOBAL_SETTINGS.ALERT_SETTINGS.rectWidth,   // Breite
                        rectY + GLOBAL_SETTINGS.ALERT_SETTINGS.rectHeight   // Höhe
                    );
                    g.setColor('#000000'); // Zurück zu Schwarz
                }
*/              
              
              
            }
        }
        
        g.flip();
    },
    
    // DEINE ORIGINAL SCROLLING-LOGIK - UNVERÄNDERT!
    setupSwipeScrolling: function(dataLines) {
        console.log("=== Setup DEINE ORIGINAL SCROLLING-LOGIK ===");
        
        Bangle.removeAllListeners('swipe');
        Bangle.removeAllListeners('touch');
        
        var self = this;
        
        Bangle.on('swipe', function(directionLR, directionUD) {
            console.log("neu === SWIPE erkannt ===","GLOBAL_FILE_LIST.busy_flag" ,GLOBAL_FILE_LIST.busy_flag);
            console.log("LR:", directionLR, "UD:", directionUD);
          
           if ((directionLR === 1) && (GLOBAL_FILE_LIST.busy_flag === false))
           {
              countdown_timer =  countdown_timer_init ;
              if (GLOBAL_FILE_LIST.index > 0)
              {  
                 
                // Bangle.setLocked(true);
                GLOBAL_FILE_LIST.busy_flag = true;
                 GLOBAL_FILE_LIST.index--;
              
                 var logDatei_name = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];               
                 console.log("neuu-------->Name :",logDatei_name);
              
                 g.clear();
                 
                 var b = logDatei_name.replace("RADIATION_", "").replace(".csv", "");
                  
 
                
                 drawCenteredText(b, 16, 25);
                
                 drawCenteredText(GLOBAL_FILE_LIST.index + 1 +"/" + GLOBAL_FILE_LIST.count, 70, 38);

                 showLogdatei_neu(logDatei_name);
                 GLOBAL_FILE_LIST.busy_flag = false;
                 //Bangle.setLocked(false);
               }
          
            }
/*            
            // LINKS-NACH-RECHTS = BEENDEN
            if (directionLR === 1) {
                console.log("Wischen LINKS-NACH-RECHTS = BEENDEN");
              //  self.cleanup();
              //  showAllLogsWithoutWarnings();
                return;
            }
            
*/          
            
            // LINKS-NACH-RECHTS  am Ende der Liste = BEENDEN
            if ((directionLR === -1) && (GLOBAL_FILE_LIST.busy_flag === false))
            {
                countdown_timer =  countdown_timer_init ;
                console.log("neu ---->Wischen RECHTS-NACH-LINKS ");
                if (GLOBAL_FILE_LIST.index < GLOBAL_FILE_LIST.count -1 )
                {
                   Bangle.setLocked(true);
                   GLOBAL_FILE_LIST.busy_flag = true;
                  
                   GLOBAL_FILE_LIST.index ++;
                   var logDatei = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];  
                   console.log("neu -------->Name :",logDatei);
              
                   g.clear();
              
                  
                   var a = logDatei.replace("RADIATION_", "").replace(".csv", "");
                  
                  
                   drawCenteredText(a , 16, 25);
 
                   drawCenteredText(GLOBAL_FILE_LIST.index + 1 +"/" + GLOBAL_FILE_LIST.count, 70, 38);
 
                   showLogdatei_neu(logDatei);
                   GLOBAL_FILE_LIST.busy_flag = false;
                  Bangle.setLocked(false);
                }
                else
                {
                   self.cleanup();
                   showAllLogsWithoutWarnings();
                   return;
                }
              
            }
            
          
          
          
          
          
            // NACH OBEN = seitenweise runter scrollen
            if (directionUD === -1) {
                console.log("neu Wischen NACH OBEN = seitenweise runter scrollen");
                 countdown_timer =  countdown_timer_init ;
                //var pageSize = self.visibleLines - 1; // Eine Zeile �berlappung
                //var maxIndex = Math.max(0, self.items.length - self.visibleLines);
                
                //var newIndex = self.currentIndex + pageSize;
                
				        var itemsPerPage = 5; // 5 Zeilen pro Seite
//                var maxIndex = Math.max(0, self.items.length - itemsPerPage);
                
                         
                  console.log("neu--------------HIER");
                
              var maxIndex = Math.max(0, dataLines.length - itemsPerPage);
           
                  console.log("neu dataLines.length:", dataLines.length);
              
              
                var newIndex = self.currentIndex + itemsPerPage;

				if (newIndex <= maxIndex) {
                    self.currentIndex = newIndex;
                    console.log("Neuer Index:", self.currentIndex);
                    self.display(dataLines);
                } else {
                    // Letzte Seite
                    self.currentIndex = maxIndex;
                    console.log("Letzte Seite:", self.currentIndex);
                    self.display(dataLines);
                   
                  
                }
            }
            // NACH UNTEN = seitenweise hoch scrollen (DEINE LOGIK!)
            else if (directionUD === 1) {
                console.log("Wischen NACH UNTEN = seitenweise hoch scrollen");
                
                //var pageSize = self.visibleLines - 1; // Eine Zeile �berlappung
                
                //var newIndex = self.currentIndex - pageSize;  // DEINE Logik!
				
				          var itemsPerPage = 5; // 5 Zeilen pro Seite
                  var newIndex = self.currentIndex - itemsPerPage;
				 
                if (newIndex >= 0) {
                    self.currentIndex = newIndex;
                    console.log("neu Neuer Index:", self.currentIndex);
                    self.display(dataLines);
                } else {
                    // Erste Seite - DEINE Logik!
                    self.currentIndex = 0;
                    console.log("neu Erste Seite:", self.currentIndex);
                    self.display(dataLines);
                }
            }
        });
        
        // TOUCH für Zurück
        Bangle.on('touch', function(button, xy) {
            console.log("=== Touch erkannt ===");
            console.log("Y:", xy.y);
            //var busy_flag = false;
            // Ganz unten = zurück
            if (xy.y > 160) 
            {
                countdown_timer =  countdown_timer_init ;
                console.log("Zurück zum Hauptmenue");
                //self.cleanup();
                //showAllLogsWithoutWarnings();
            }
          else if ((xy.y < 50) && (GLOBAL_FILE_LIST.busy_flag === false))
          {
            var logDatei_name;
            GLOBAL_FILE_LIST.busy_flag = true;
            
            
            
            countdown_timer =  countdown_timer_init ;
            E.showPrompt("Soll die Datei gelöscht werden?").then(function(v) 
             {
               if (v) 
               {
                  console.log("'Ja' chosen");
                    // TATSÄCHLICHES Löschen
            //performActualFileDeletion(GLOBAL_FILE_LIST.dateiname);
                  
                 logDatei_loeschen( GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index]);
                  
                 if (GLOBAL_FILE_LIST.count > 0)    // sind noch LOG Datein da ??
                  {
                    
                    if (GLOBAL_FILE_LIST.index > GLOBAL_FILE_LIST.count-1)  // für letzte Element korrigieren
                    {
                     
                      GLOBAL_FILE_LIST.index = GLOBAL_FILE_LIST.count-1;
                      
                    }
                    
                    
                    
                    logDatei_name = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];
                    //console.log("-------->Name :",logDatei_name);
                    GLOBAL_FILE_LIST.busy_flag = false;
                    showLogdatei_neu(logDatei_name);
                    
                    return;
                  
                  }
                 
                 
               } 
               else 
               {
                  console.log("'Nein' chosen");     // Zurück zur Anzeige
                    
                  logDatei_name = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];
                  //console.log("-------->Name :",logDatei_name);
                  
                 GLOBAL_FILE_LIST.busy_flag =false;
                 showLogdatei_neu(logDatei_name);
                 
                  return;
              
               }
          });
            
            
          }
            
        });
    },

  
     // Aufräumen
    cleanup: function() {
        console.log("=== Cleanup ===");
        Bangle.removeAllListeners('swipe');
        Bangle.removeAllListeners('touch');
    }
}; 
   

//----------------------------------------------------------
//29_09
// === CUSTOM SCROLL-VIEW MIT DEINER ORIGINAL-LOGIK UND ALERTS ===
var CustomScrollView = {
    items: [],
    currentIndex: 0,
    fontSize: 24,
    lineHeight: 24,
    visibleLines: 7,
    startY: 0,
    fixedDate: "",
    measurementCount: 0,
    
    // Initialisierung
    init: function(title, dataLines) {
        console.log("=== DEINE ORIGINAL-LOGIK Init ===");
        
        this.items = [];
        this.currentIndex = 0;
        this.fixedDate = title;
        this.measurementCount = dataLines.length;
        
      
//       var startTime = Date.now();
      
// dauert 9,56 s       
        // Datenzeilen MIT Alerts
        for (var i = 0; i < dataLines.length; i++) {
            var processedLine = this.processLineWithAlert(dataLines[i]);
            this.items.push({
                //type: "data",
                t: processedLine.text
                //fontSize: GLOBAL_SETTINGS.FONT_SIZES.messwerte,
                //alert: processedLine.alert      // Alert-Flag hinzugefügt!
            });
        }
        
      
/*      
       var endTime = Date.now();
       var executionTime = endTime - startTime;
      executionTime = executionTime.toFixed(0);
      console.log("++++++++++this.items.push(",executionTime, "ms");   
*/      
      
      
        // LEERZEILEN hinzufügen für volle Seiten
        var itemsPerPage = 5; // 5 Datenzeilen pro Seite
        var remainder = this.items.length % itemsPerPage;
        
        if (remainder !== 0) {
            var emptyLinesNeeded = itemsPerPage - remainder;
            for (var j = 0; j < emptyLinesNeeded; j++) {
                this.items.push({
                    //type: "empty",
                    t: ""  // Leere Zeile
                    //fontSize: GLOBAL_SETTINGS.FONT_SIZES.small,
                    //alert: false  // Kein Alert bei Leerzeilen
                });
            }
            console.log("Leerzeilen hinzugefügt:", emptyLinesNeeded);
        }
        
        console.log("Gesamt Items:", this.items.length);
        this.display();
      
      
//      console.log(this.items);
      
      
      
        this.setupSwipeScrolling();
    },
    
    // LINIE MIT Alert-Information verarbeiten
    processLineWithAlert: function(line) {
        try {
            var parts = line.split(',');
            
            if (parts.length >= 2) {
                var timePart = parts[0].trim();
                var cpmPart = parts[1].trim();
                var cpmValue = parseInt(cpmPart) || 0;
                
                // Alert prüfen
                var hasAlert = cpmValue > GLOBAL_SETTINGS.ALERT_SETTINGS.grenzwert;
                
                if (timePart && timePart.includes(':')) {
                    var timeComponents = timePart.split(':');
                    
                    // HH:MM:SS -> HH:MM
                    if (timeComponents.length === 3) {
                        var timeWithoutSeconds = timeComponents[0] + ":" + timeComponents[1];
                        return {
                            text: timeWithoutSeconds + "   " + cpmPart,
                            alert: hasAlert  // Alert-Flag setzen
                        };
                    }
                    // HH:MM -> bleibt
                    else if (timeComponents.length === 2) {
                        return {
                            text: timePart + "   " + cpmPart,
                            alert: hasAlert  // Alert-Flag setzen
                        };
                    }
                    // Andere -> Standard
                    else {
                        return {
                            text: timePart + "   " + cpmPart,
                            alert: hasAlert  // Alert-Flag setzen
                        };
                    }
                }
            }
        } catch (e) {
            // ignore
        }
        
        return {
            text: line,
            alert: false  // Kein Alert bei Fehler
        };
    },
    
    // Anzeige MIT Alerts
    display: function() {
        console.log("=== DEINE ORIGINAL-ANZEIGE MIT ALERTS ===");
        console.log("Aktueller Index:", this.currentIndex);
        
        g.clear();
        g.setColor('#ffffff');
        g.fillRect(0, 0, 176, 176);
        g.setColor('#000000');
        
        // ERSTE ZEILE: Datum + Fortschritt
        var totalItems = this.measurementCount;
        var currentItem = this.currentIndex + 1;
        var progressLine = this.fixedDate + " (" + currentItem + "/" + totalItems + ")";
        
        g.setFont("Vector", GLOBAL_SETTINGS.FONT_SIZES.title);
       
// vati      
        g.drawString(progressLine, 10, 5);   // zeichnet die erste Zeile, hier muß das rote Rechteckgesetzt werden
       
     // alert_vorhanden = false;
/*
      
      if (alert_vorhanden === true)
        {
         
          g.setColor(GLOBAL_SETTINGS.ALERT_SETTINGS.rectColor);
          g.fillRect( 1,8, 1 + GLOBAL_SETTINGS.ALERT_SETTINGS.rectWidth,   // Breite
                           8 + GLOBAL_SETTINGS.ALERT_SETTINGS.rectHeight); // Höhe
          g.setColor('#000000');                                           // Zurück zu Schwarz         
        }
*/ 
      
//---      
         
      if (alert_vorhanden === true)
        {
           g.setColor(RED); 
      
        }
        else
        {
            g.setColor(BLACK); 
        }
          

          g.drawLine(0, 25, 176, 25);     // Trennlinie  
          g.drawLine(0, 25+1, 176, 25+1);     // Trennlinie  
          
          g.setColor(BLACK); 
      
//---      
      
        // Überschrift
        g.setFont("Vector", GLOBAL_SETTINGS.FONT_SIZES.header);
        
      
      
        //g.drawString("  Zeit  CPM  µSv/h", 10, 35);
      
      
        if (GLOBAL_SETTINGS.messwert_einheit === GMZ)
        {
          g.drawString("  Zeit     CPM  ", 10, 35);
        }
        else
        {
          g.drawString("  Zeit    µSv/h", 10, 35);
        }
       
      
      
        // DATENZEILEN MIT Alerts
        var startY = 60;
        var itemsPerPage = 5; // 5 Zeilen pro Seite
        console.log("Zeige", itemsPerPage, "Zeilen");
        
        for (var i = 0; i < itemsPerPage; i++) {
            var itemIndex = this.currentIndex + i;
            if (itemIndex < this.items.length) {
                var item = this.items[itemIndex];
               
   //           console.log(item);
   //           console.log(content[1],content[2],content[3],content[4]);
              
              
              
              
                var y = startY + (i * GLOBAL_SETTINGS.LINE_SPACING);
                
                //g.setFont("Vector", item.fontSize);
				
				g.setFont("Vector", GLOBAL_SETTINGS.FONT_SIZES.messwerte);
				
				
                if (item.t !== "") {  // Nur nicht-leere Zeilen anzeigen                 
//Vati           
//                console.log(item.t+ "\n");  
//18_09                  
                 var result = extractTimeAndCPM(item.t);
//               console.log("Ergebnis:", JSON.stringify(result));
                 var cpm  =   result.cpm ;  
                
              //    console.log("G_S.m_einheit:",GLOBAL_SETTINGS.messwert_einheit + "\n"); 
                  
                  
                  
                
                  
                  var uSv_wert;
            
                 if (GLOBAL_SETTINGS.messwert_einheit === uSv) 
                 { 
                   //uSv_wert = 0.20;
                   
                   uSv_wert= intelligentConversionForDisplay(cpm);
                   
                 }
                  
                  
                
                 var zeit =   result.time ;                        
                
                  
                var x=10;
                
  //              g.drawString(zeit, x, y);
                  
                  x = 140;
    
//********************* TEST Formatierung testen ***********************                  
                  
                  
/*                  
                  
                if (i===1)
                {
                
                  cpm=999;
                }
                 
                  if (i===2)
                {
                
                  cpm=9999;
                }
                 
                  if (i===4)
                {
                
                  cpm=99999;
                }
                  
*/                  
                  
                 var zeile = zeit+"    "+cpm;   // 2 stellige Anzeige
                 
                 if (cpm > 99 && cpm < 1000)
                 {
                   x= x- 16;
                   zeile = zeit+"   "+cpm;     // 3 stellige Anzeige
                 }
                 else if (cpm > 999 && cpm < 10000)
                 {
                    x= x-32;
                    zeile = zeit+"  "+cpm;     // 4 stellige Anzeige
             
                 }
                 else if ( cpm>9999 && cpm < 100000)
                 {
                   x=x-45;
                 
                 }
                  
                  if (cpm >35)
                  {
                  
                  g.setColor('#ff0000');
                  }
                  
                  if (GLOBAL_SETTINGS.messwert_einheit === uSv)  
                  {
                     
                    
                    
                    x=x-30;
                    
                    
                    
                    g.drawString(uSv_wert, x, y);
                  }
                  else
                  {
                    g.drawString(cpm, x, y);
                  }
                
                  
                  g.setColor('#000000');
                  
                  
//                g.drawString(item.t, 10, y);
               
                  //g.drawString(zeile, 10, y);
                 
//                  console.log(zeile + "\n");  
                  
             //    console.log(item.t+ "\n");                 
               
                  
                }
                
                // ALERT-RECHTECK zeichnen wenn nötig
                if (item.alert === true) {
                    g.setColor(GLOBAL_SETTINGS.ALERT_SETTINGS.rectColor);
                    
                    // KONFIGURIERBARE Position:
                    var rectX = GLOBAL_SETTINGS.ALERT_SETTINGS.posX;  // LINKER Rand
                    var rectY = y + GLOBAL_SETTINGS.ALERT_SETTINGS.posY; // Mitte der Zeile
                    
                    g.fillRect(
                        rectX, 
                        rectY,
                        rectX + GLOBAL_SETTINGS.ALERT_SETTINGS.rectWidth,   // Breite
                        rectY + GLOBAL_SETTINGS.ALERT_SETTINGS.rectHeight   // Höhe
                    );
                    g.setColor('#000000'); // Zurück zu Schwarz
                }
            }
        }
        
        g.flip();
    },
    
    // DEINE ORIGINAL SCROLLING-LOGIK - UNVERÄNDERT!
    setupSwipeScrolling: function() {
        console.log("=== Setup DEINE ORIGINAL SCROLLING-LOGIK ===");
        
        Bangle.removeAllListeners('swipe');
        Bangle.removeAllListeners('touch');
        
        var self = this;
        
        Bangle.on('swipe', function(directionLR, directionUD) {
            console.log("=== SWIPE erkannt ===");
            console.log("LR:", directionLR, "UD:", directionUD);
            var busy_flag = false;
           if ((directionLR === 1) && (busy_flag === false))
           {
              countdown_timer =  countdown_timer_init ;
              if (GLOBAL_FILE_LIST.index > 0)
              {  
                 
                 Bangle.setLocked(true);
                busy_flag = true;
                 GLOBAL_FILE_LIST.index--;
              
                 var logDatei_name = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];               
                 console.log("-------->Name :",logDatei_name);
              
                 g.clear();
                 
                 var b = logDatei_name.replace("RADIATION_", "").replace(".csv", "");
                  
 
                
                 drawCenteredText(b, 16, 25);
                
                 drawCenteredText(GLOBAL_FILE_LIST.index + 1 +"/" + GLOBAL_FILE_LIST.count, 70, 38);

                 showLogdatei(logDatei_name);
                 busy_flag = false;
                 Bangle.setLocked(false);
               }
          
            }
/*            
            // LINKS-NACH-RECHTS = BEENDEN
            if (directionLR === 1) {
                console.log("Wischen LINKS-NACH-RECHTS = BEENDEN");
              //  self.cleanup();
              //  showAllLogsWithoutWarnings();
                return;
            }
            
*/          
            
            // LINKS-NACH-RECHTS  am Ende der Liste = BEENDEN
            if ((directionLR === -1) && (busy_flag === false))
            {
                countdown_timer =  countdown_timer_init ;
                console.log("---->Wischen RECHTS-NACH-LINKS ");
                if (GLOBAL_FILE_LIST.index < GLOBAL_FILE_LIST.count -1 )
                {
                   Bangle.setLocked(true);
                   busy_flag = true;
                  
                   GLOBAL_FILE_LIST.index ++;
                   var logDatei = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];  
                   console.log("-------->Name :",logDatei);
              
                   g.clear();
              
                  
                   var a = logDatei.replace("RADIATION_", "").replace(".csv", "");
                  
                  
                   drawCenteredText(a , 16, 25);
 
                   drawCenteredText(GLOBAL_FILE_LIST.index + 1 +"/" + GLOBAL_FILE_LIST.count, 70, 38);
 
                   showLogdatei(logDatei);
                   busy_flag = false;
                  Bangle.setLocked(false);
                }
                else
                {
                   self.cleanup();
                   showAllLogsWithoutWarnings();
                   return;
                }
              
            }
            
          
          
          
          
          
            // NACH OBEN = seitenweise runter scrollen
            if (directionUD === -1) {
                console.log("Wischen NACH OBEN = seitenweise runter scrollen");
                 countdown_timer =  countdown_timer_init ;
                //var pageSize = self.visibleLines - 1; // Eine Zeile �berlappung
                //var maxIndex = Math.max(0, self.items.length - self.visibleLines);
                
                //var newIndex = self.currentIndex + pageSize;
                
				        var itemsPerPage = 5; // 5 Zeilen pro Seite
                var maxIndex = Math.max(0, self.items.length - itemsPerPage);
                var newIndex = self.currentIndex + itemsPerPage;

				if (newIndex <= maxIndex) {
                    self.currentIndex = newIndex;
                    console.log("Neuer Index:", self.currentIndex);
                    self.display();
                } else {
                    // Letzte Seite
                    self.currentIndex = maxIndex;
                    console.log("Letzte Seite:", self.currentIndex);
                    self.display();
                }
            }
            // NACH UNTEN = seitenweise hoch scrollen (DEINE LOGIK!)
            else if (directionUD === 1) {
                console.log("Wischen NACH UNTEN = seitenweise hoch scrollen");
                
                //var pageSize = self.visibleLines - 1; // Eine Zeile �berlappung
                
                //var newIndex = self.currentIndex - pageSize;  // DEINE Logik!
				
				          var itemsPerPage = 5; // 5 Zeilen pro Seite
                  var newIndex = self.currentIndex - itemsPerPage;
				 
                if (newIndex >= 0) {
                    self.currentIndex = newIndex;
                    console.log("Neuer Index:", self.currentIndex);
                    self.display();
                } else {
                    // Erste Seite - DEINE Logik!
                    self.currentIndex = 0;
                    console.log("Erste Seite:", self.currentIndex);
                    self.display();
                }
            }
        });
        
        // TOUCH für Zurück
        Bangle.on('touch', function(button, xy) {
            console.log("=== Touch erkannt ===");
            console.log("Y:", xy.y);
            var busy_flag = false;
            // Ganz unten = zurück
            if (xy.y > 160) 
            {
                countdown_timer =  countdown_timer_init ;
                console.log("Zurück zum Hauptmenue");
                //self.cleanup();
                //showAllLogsWithoutWarnings();
            }
          else if ((xy.y < 50) && (busy_flag === false))
          {
            var logDatei_name;
            countdown_timer =  countdown_timer_init ;
            E.showPrompt("Soll die Datei gelöscht werden?").then(function(v) 
             {
               if (v) 
               {
                  console.log("'Ja' chosen");
                    // TATSÄCHLICHES Löschen
            //performActualFileDeletion(GLOBAL_FILE_LIST.dateiname);
                  
                 logDatei_loeschen( GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index]);
                  
                 if (GLOBAL_FILE_LIST.count > 0)    // sind noch LOG Datein da ??
                  {
                    
                    if (GLOBAL_FILE_LIST.index > GLOBAL_FILE_LIST.count-1)  // für letzte Element korrigieren
                    {
                     
                      GLOBAL_FILE_LIST.index = GLOBAL_FILE_LIST.count-1;
                      
                    }
                    
                    
                    
                    logDatei_name = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];
                    //console.log("-------->Name :",logDatei_name);
                    showLogdatei(logDatei_name);
                    return;
                  
                  }
                 
                 
               } 
               else 
               {
                  console.log("'Nein' chosen");     // Zurück zur Anzeige
                    
                  logDatei_name = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];
                  //console.log("-------->Name :",logDatei_name);
                  showLogdatei(logDatei_name);
                  return;
              
               }
          });
            
            
          }
            
        });
    },

  
     // Aufräumen
    cleanup: function() {
        console.log("=== Cleanup ===");
        Bangle.removeAllListeners('swipe');
        Bangle.removeAllListeners('touch');
    }
}; 
   

//01_10 === LOG-DATEI ANZEIGEN ===

//etwa 58000 Byte in 6s 
// etwa 10000 Byte werden pro Sekunde gelesen
// etwa 240 Zeilen pro Sekunde

function showLogdatei_neu(logDatei_name) {
    try {
        
      
      
//      var startTime = Date.now();
      
  console.log("Öffne Log-Datei:", logDatei_name);
 
  var dataLines = [];
       
     
  var index= 0;       
  var zeile;
  var lade_anzeige = false;
  var index_merker=240;
  var fortschritt_anzeige = false;     
  var f = require("Storage").open(logDatei_name, "r");
  var fileSize = f.getLength();
    
//04_10      
      
  //Bangle.setOptions({btnLoadTimeout : 9000});
      
//    Bangle.setOptions ( {backlightTimeout :9000});
          
//    Bangle.setOptions ( {lockTimeout :9000});   
      
      
  var x_pos;
      
  if (fileSize === 0) 
  {
    E.showMessage("Leere Datei", "Inhalt");
    setTimeout(showAllLogsWithoutWarnings, 2000);
    return;
  }   
  
      
//    E.showMessage (logDatei_name , "Load DATA ");
  
   if (fileSize > 10000 )
   {
      lade_anzeige= true;
       
       g.clear();
       g.setColor(BLACK);         
       var b = logDatei_name.replace("RADIATION_", "").replace(".csv", "");
       x_pos= drawCenteredText(b, 16, 25);
       g.setFont("Vector", 30);
       g.drawString("load .",x_pos,80);    
       
       x_pos = x_pos + 85; 
       fortschritt_anzeige = true;
     
       g.flip();        
   }
     
   var startTime = Date.now();     
      
  var kopf_zeile = f.readLine();
      
      
  while (true)
  {
      zeile =f.readLine();
//    console.log(index ,":",zeile);
    
      if (zeile === undefined)
      {
        break;
      }
    
    dataLines[index]=zeile;
    
      index++;
    
    if ((index >  index_merker) && (fortschritt_anzeige === true))   // etwa 1 s vergangen
    {
      index_merker = index_merker + 240;  
    
      g.drawString(".",x_pos,80); 
      
      x_pos = x_pos + 10;
      
      g.flip();
    
    }
    
  }
  
  console.log("----------> Zeilenanzahl",index);
      
       if ( GLOBAL_FILE_LIST.index === GLOBAL_FILE_LIST.count-1)  // ist es die neuste Datei, dann Reihenfolge umkehren
       {
            
// === NEU: Log-Reihenfolge umkehren ===

        dataLines.reverse();
//-------------      
       }
      
        
        if (dataLines.length === 0) {
            E.showMessage("Keine Daten", "Inhalt");
            setTimeout(showAllLogsWithoutWarnings, 2000);
            return;
        }
        

        var dateTitle = logDatei_name.replace("RADIATION_", "").replace(".csv", "");
        
         
          alert_vorhanden = hasAlertValues_neu(dataLines);
      
         console.log( "--->Alarme vorhanden : ",alert_vorhanden);
      
//03_10
      

      
       var endTime = Date.now();
       var executionTime = endTime - startTime;
       executionTime = executionTime.toFixed(0);
       console.log(" Datei:",logDatei_name, "laden",executionTime, "ms");   
      
            
      
          CustomScrollView_neu.init(dateTitle, dataLines);
      
      
// 5. VARIABLEN FREIGEBEN

//        content = null;
        dataLines = null;
      
      
      
        
    } catch (e) {
        E.showMessage("Fehler: " + e.message, "Lesen");
        setTimeout(showAllLogsWithoutWarnings, 2000);
    }
}





//-------------------------------

function showLogdatei(logDatei_name) {
    try {
        
 //      var startTime = Date.now();
      
        console.log("Öffne Log-Datei:", logDatei_name);
        
        var f = require("Storage").open(logDatei_name, "r");
        var fileSize = f.getLength();
        
        if (fileSize === 0) {
            E.showMessage("Leere Datei", "Inhalt");
            setTimeout(showAllLogsWithoutWarnings, 2000);
            return;
        }
        
 //       var content = f.read(fileSize);   // hier wird das gesamte File eingelesen
          content = f.read(fileSize);   // hier wird das gesamte File eingelesen
 
      
       if ( GLOBAL_FILE_LIST.index === GLOBAL_FILE_LIST.count-1)  // ist es die neuste Datei, dann Reihenfolge umkehren
       {
      
      
//20_09      
// === NEU: Log-Reihenfolge umkehren ===
      
        content = reverseLogContent(content);

//-------------      
       }
      
//      var startTime = Date.now();
      
/*      
      var endTime = Date.now();
      var executionTime = endTime - startTime;
      executionTime = executionTime.toFixed(0);
      console.log("--->Ausführungszeit Datei laden:",executionTime, "ms");   
*/            
      var startTime = Date.now();
      
      // dauert 12s !!!!!!!
         var dataLines = content.split('\n').filter(line => line.trim() !== "").slice(1);  // OHNE Header + Zwischenvariable!
     
     
      var endTime = Date.now();
      var executionTime = endTime - startTime;
      executionTime = executionTime.toFixed(0);
      console.log("--->Ausführungszeit :",executionTime, "ms");   
 
/*      
      console.log(content);
      console.log("---------------");
      
      console.log(dataLines);
*/      
      
       // var lines = content.split('\n').filter(line => line.trim() !== "");
        
        if (dataLines.length === 0) {
            E.showMessage("Keine Daten", "Inhalt");
            setTimeout(showAllLogsWithoutWarnings, 2000);
            return;
        }
        
  //      var dataLines = lines.slice(1); // Ohne Header
        var dateTitle = logDatei_name.replace("RADIATION_", "").replace(".csv", "");
        
//        log(dataLines); //"03:22:29,31",
                        // "14:33:26,57"    
       
       // this.alert_vorhanden = hasAlertValues(dataLines);
      
 //       log( "--->Alarme vorhanden : ",this.alert_vorhanden);
           
          alert_vorhanden = hasAlertValues(dataLines);
      
         console.log( "--->Alarme vorhanden : ",alert_vorhanden);
      
//20_09  
      
      
        console.log( "---------------------");
 //       console.log( dataLines); 
//      console.log( lines); 
/*    so sieht die Liste aus  
      [
  "17:21,18",
  "17:20,15",
  "17:19,12",
  "17:18,14",
  "17:17,17",
  "17:16,19",
  "17:15,16",
  "17:14,21",
  "17:13,17",
*/      
      
      
      
      
      
        console.log( "---------------------");  
        
      
      
      
      
      
//01_10      
      
        CustomScrollView_neu.init(dateTitle, dataLines);
      
      
// 5. VARIABLEN FREIGEBEN

//        content = null;
        dataLines = null;
      
      
      
        
    } catch (e) {
        E.showMessage("Fehler: " + e.message, "Lesen");
        setTimeout(showAllLogsWithoutWarnings, 2000);
    }
}

// === HAUPTMENu ===
function showAllLogsWithoutWarnings() {
     g.clear();
  console.log("**********Zurück zum Hauptmenue***************");
     // Hier kommt dein Hauptmenue-Code
 // Bangle.showLauncher();
  
  try {
        console.log("=== VERLASSE Messwert-App ===");
        
        // Aufräumen
        Bangle.removeAllListeners('swipe');
        Bangle.removeAllListeners('touch');
        g.clear();
        
        // Direkt zur Auswertungs-App
        load("radiation.app.js"); // Deine Auswertungs-App
        
    } catch (e) {
        console.log("Fehler beim Wechsel:", e.message);
        Bangle.showLauncher(); // Fallback
    }
  
  
  
}


              
// console.log("G_S.m_einheit:",GLOBAL_SETTINGS.messwert_einheit + "\n");  
 radiation_setting_laden();  
// console.log("G_S.m_einheit:",GLOBAL_SETTINGS.messwert_einheit + "\n"); 
                  
 
var Timer_1 = setInterval(function() 
          {
            
            if ( countdown_timer > 0)
            {
               countdown_timer--;
            }
            else
            {
               showAllLogsWithoutWarnings();   // App wird verlassen und in die Scan App gesprungen
            }
              //console.log("countdown_timer:",countdown_timer);
  
          }, 1000);


//------

setWatch(function(f) {
   
  button_click_zaehler ++;
  
  console.log("Pressed");
  
    
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








//-------

// Bessere Lösung mit backlight Event
Bangle.on('lock', function(isLocked) {
    if (!isLocked) {
        console.log(" *** LOCK OFF *** ");
        // Beim Entsperren 
      
        Bangle.setLCDBrightness(0);
       g.setColor(WHITE);
       g.fillRect( 1,8, 1 + GLOBAL_SETTINGS.ALERT_SETTINGS.rectWidth,   // Breite
                        8 + GLOBAL_SETTINGS.ALERT_SETTINGS.rectHeight); // Höhe

 
    } else {
        console.log(" *** LOCK ON *** ");
        // Beim Sperren
        g.setColor(BLACK);
        g.fillRect( 1,8, 1 + GLOBAL_SETTINGS.ALERT_SETTINGS.rectWidth,   // Breite
                         8 + GLOBAL_SETTINGS.ALERT_SETTINGS.rectHeight); // Höhe

    }
});

// Backlight Event für Display-Änderungen
Bangle.on('backlight', function(backlightOn) {
    console.log("Backlight:", backlightOn);
    // Kurze Verzögerung für Widget-Stabilisierung
});


//------


//-------
// === TEST MIT ALERTS ===
setTimeout(function() {
    console.log("=== START ALERTS TEST ===");
    
//    var logDatei_name = "RADIATION_2025-09-08.csv";
/*  
   // Heutige Datei prüfen
    var logDatei_name = checkTodaysLogFileExists();
    if (logDatei_name) {
        console.log("Heute gefunden:", logDatei_name);
    } else {
        console.log("Heute nicht gefunden");
       logDatei_name = "RADIATION_2025-09-08.csv";
    }
*/
     
  
   console.log("HIER BIN ICH");
   Bangle.setOptions({wakeOnBTN1 : true});

   Bangle.setLCDBrightness(0);
   Bangle.setOptions ( {lockTimeout :10000});  // lock nach 10s weile laden der LOg bis 6s dauern kann
  
//  test_log_datei_schreiben();
 
		
//-------------------------------------------------------------------   
/*
  
// Dauer für 1 Tag  etwa 3,6 s  
  
  var startTime = Date.now();
  
 // var f_name="RADIATION_2025-09-29.csv";
    var f_name="RADIATION_2025-09-30.csv";
  
  
  var f = require("Storage").open(f_name, "r");
  var index= 0;       
  var zeile;
  var kopf_zeile = f.readLine();
  
  while (true)
  {
      zeile =f.readLine();
//    console.log(index ,":",zeile);
    
      if (zeile === undefined)
      {
        break;
      }
    
    gespeicherte_messwerte[index]=zeile;
    
    
    
      index++;
  }
  
   console.log("----------> Zeilenanzahl",index);
  
  
   var endTime = Date.now();
   var executionTime = endTime - startTime;
   executionTime = executionTime.toFixed(0);
   console.log("--->Ausführungszeit Datei laden:",executionTime, "ms");  
  
  // console.log(gespeicherte_messwerte[0]);
 
   var time = gespeicherte_messwerte[0].slice(0,5);
  
   var cpm = gespeicherte_messwerte[0].slice(6);
  
   console.log(time ," ",cpm);
  
  
  
  
   for (var i=0; i< index ;i++)
   {
    
     console.log(gespeicherte_messwerte[i]);
     
   }
  
   console.log("--------------------------");
    
   gespeicherte_messwerte .reverse();
  
   for (var i=0; i< index ;i++)
   {
    
     console.log(gespeicherte_messwerte[i]);
     
   }
    
  
  
     console.log("--------------------------");  
  
  
//  14:30,36
//  13:33,23
  
//    gespeicherte_messwerte = null;  Array löschen
     
*/
//-------------------------------------------------------------------------  
  
  
// DATEI Liste füllen
    
  var startTime = Date.now();
  
//   var fileCount = populateFileList();
    GLOBAL_FILE_LIST.count=0; 
    
   var filename =  GLOBAL_FILE_LIST.dateiname;

		var rueckwert = loadFileList(filename);
    
      if (rueckwert === false)
		{
		   console.log("Datei nicht vorhanden :", filename);
       
      showAllLogsWithoutWarnings();  // zurück ins Scanprogramm
       
		}
		else
		{
		   console.log("1.Element",GLOBAL_FILE_LIST.files[0] );
       console.log(filename , "gelesen" ,GLOBAL_FILE_LIST.count , "Elemente");
		}
  
   var endTime = Date.now();
   var executionTime = endTime - startTime;
      executionTime = executionTime.toFixed(0);
      console.log("Ausführungszeit Dateiensuche:",executionTime, "ms");   
  GLOBAL_FILE_LIST.index = GLOBAL_FILE_LIST.count-1;
     //console.log("-------->Name :",);
    logDatei_name = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];  
   // logDatei_name=GLOBAL_FILE_LIST.files[0];
     
  console.log("-------->Name :",logDatei_name);
   
showLogdatei_neu(logDatei_name);
  
  console.log("**********************************");
  
//  showLogdatei(logDatei_name);
  
                  
    
  
  
}, 1000);



