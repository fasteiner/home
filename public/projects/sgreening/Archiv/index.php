<html lang="en">

  <head>
	<link rel="shortcut icon" href="img/Logo.png" type="image/x-icon">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="Fabian Steiner">

    <title>SGREENING</title>

    <!-- Bootstrap core CSS -->
    <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
	
	<!-- Popup-->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
	
	<!-- Custom fonts for this template -->
    <link href="vendor/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic" rel="stylesheet" type="text/css">
    <link href='https://fonts.googleapis.com/css?family=Cabin:700' rel='stylesheet' type='text/css'>
	
    <!-- Custom styles for this template -->
    <link href="css/grayscale.min.css" rel="stylesheet">
	<link href='https://fonts.googleapis.com/css?family=Inconsolata' rel='stylesheet'>
	<link href="css/custom.css" rel="stylesheet">
	<script src='https://www.google.com/recaptcha/api.js'></script>
  </head>

  <body id="page-top" data-spy="scroll" data-target=".navbar" data-offset="-600">
	  <div class="modal fade" id="myModal" role="dialog">
		<div class="modal-dialog">
		  <!-- Modal content-->
		  <div class="modal-content">
			<div class="modal-header">
			  <h4 class="modal-title" style= "text-align: left;">Kontaktieren Sie uns:</h4>
			</div>
			<form class="contact" name="contact" action = "process.php" method ="post">
				<div class="modal-body">
					<label for="name">Ihr Name</label><br>
					<input type="text" name="name" class="input-xlarge" style = "width:100%"><br>
					<label for="email">Ihre Email-Adresse (damit wir Ihnen antworten können)</label><br>
					<input type="email" name="email" class="input-xlarge" style = "width:100%"><br>
					<label for="subject">Ihr Betreff</label><br>
					<input type="text" name="subject" class="input-xlarge" style = "width:100%"><br>
					<label for="message">Ihre Nachricht</label><br>
					<textarea name="message" class="input-xlarge" style = "height:200px;width:100%;"></textarea>
					<div class="g-recaptcha" name="g-recaptcha-response" data-sitekey="6LdcZzEUAAAAABUgILgmUHO7pMITqJ9K9pcdpBop"></div>
					<br>
					<input type = "checkbox" name="kopie" checked></input> Kopie der Nachricht an mich senden
				</div>
				<div class="modal-footer">
						<input class="btn btn-default" type="submit" value="Senden!" id="submit">
						<a href="#" class="btn" data-dismiss="modal">Abbrechen.</a>
				</div>
			</form>
		  </div>
		  
		</div>
	  </div>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light navbar-fixed-top" id="mainNav">
      <div class="container">
		<a class="navbar-brand js-scroll-trigger" href="#page-top">
			SGREENING
		</a>
        <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
          Menu
          <i class="fa fa-bars"></i>
        </button>
        <div class="collapse navbar-collapse navbar" id="navbarResponsive">
          <ul class="navbar-right navbar-nav nav ml-auto">

            <li class="nav-item">
              <a class="nav-link js-scroll-trigger" href="#about">Projektidee</a>
            </li>
			<li class="nav-item">
              <a class="nav-link js-scroll-trigger" href="#team">Team</a>
            </li>
            <li class="nav-item">
              <a class="nav-link js-scroll-trigger" href="#status">Status</a>
            </li>
			<li class="nav-item">
              <a class="nav-link js-scroll-trigger" href="#ms">Management Summarys</a>
            </li>
            <li class="nav-item">
              <a class="nav-link js-scroll-trigger" href="#contact">Kontakt & Impressum</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Intro Header -->
    <header class="masthead">
      <div class="intro-body">
        <div class="container">
          <div class="row">
            <div class="col-lg-8 mx-auto" style = "color:#1B2209;">
              <h1 class="brand-heading"><img  src="img/Logo.png" alt = "SGREENING Logo"\></h1>
              <p class="intro-text"><span style = "color:#FFFFFF;background: rgba(27,34,9,0.6);">
			  Ein Projekt um den ökologischen Fußabdruck der Schule HTL Rennweg zu verbessern.</span>
                <br></p>
              <a href="#about" class="btn btn-circle js-scroll-trigger">
                <i class="fa fa-angle-double-down animated" style = "font-size:1.5em;text-align:center;"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- About Section -->
    <section id="about" class="content-section text-center">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <h2>Über SGREENING</h2>
            <p>Wir wollen im Bereich der IT-Infrastruktur den Stromverbrauch messen und dessen zeitlichen Verlauf über eine Woche hin dokumentieren und analysieren. Anhand dieser Daten wollen wir das Einsparungspotential ausloten und entsprechende Verbesserungsvorschläge entwickeln, als auch gegebenenfalls umsetzen.</p>
			<p>Im Server-Raum 078 soll die vorhandene Überwachungsinfrastruktur der Diplomarbeitsgruppe „Custodio“ analysiert und weiter verbessert werden. </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section id="team" class="download-section content-section text-center">
      <div class="container">
	  <h2><span style = "color:#1B2209;background: rgba(255,255,255,0.4);">Team</span></h2>
		  <div class="row">
				<figure class="col-md-3 auto-mx">
					<img src = "img/Turner.png" alt = "Projektleiter Dominik Turner"\>
					<figcaption>Dominik Turner</br>Projektleiter</figcaption>
				</figure>
				<div class="col-md-1 auto-mx"></div>
				<figure class="col-md-3 auto-mx">
					<img src = "img/Slavicky.png" alt = "Projektleiterstellvertreterin Ruth Slavicky"\>
					<figcaption>Ruth Slavicky</br>Projektleiterstv.</figcaption>
				</figure>
				<div class="col-md-1 auto-mx"></div>
				<figure class="col-md-3 auto-mx">
					<img src = "img/Steiner.png" alt = "Projektmitarbeiter Fabian Steiner"\>
					<figcaption>Fabian Steiner</br>Projektmitarbeiter</figcaption>
				</figure>
			</div>
      </div>
    </section>
	
	<!-- Blog -->
    <section id="status" class="content-section text-center">
      <div class="container">
        <div class="col-sm-12 mx-auto">
          <h2>Status</h2>
          <p>
		  <?php
			try{
			$db = new PDO("mysql:host=localhost;dbname=sgreening_status;charset=utf8","root","nalgene");
			/*Other Codes*/
			}catch(PDOException  $e ){
			echo "Error: ".$e;
			}
				?>
				<table>
				<tr>
					<th>Ampel</th>
					<th>Datum</th>
					<th>Status</th>
				</tr>
				<?php
				$sql = 'select pk_entryNr, msdate, status, blog from blogentry order by pk_entryNr desc;';
				$i = 0;
				foreach ($db->query($sql) as $row){
					$date = $row['msdate'];
					$ampel = $row['status'];
					$blog = $row['blog'];
					print "<tr>";
					print "<td class = 'ampel'><img src ='img/$ampel.png'></img></td>";
					print "<td class = 'datecol'>$date</th>";
					print "<td class = 'blog'> $blog</td>";
					print "</tr>";
					if($i == 0){
						$i = 1;
						print "</table></br><h4>weitere</h4>";
						print '<span data-toggle="collapse" data-target="#stats" class="btn btn-circle"><i class="fa fa-angle-double-down animated" style = "font-size:1.5em;text-align:center;"></i></span>';
						print "</br><table id = 'stats' class = 'collapse'>";
					}
					}
				print "</table>";	
		  ?></p>
        </div>
      </div>
    </section>
	
	<!-- Team -->
    <section id="ms" class="download-section content-section text-center">
      <div class="container">
			<h2>Management Summarys</h2>
			<div class="btn-group-vertical">
				<?php
				$i = 0;
				foreach(array_reverse(glob('ms/*')) as $file) {
					echo '<a href='.$file.' class="btn msdown" target = "_blank" style = "font-size:2em;">'.substr($file,-14,10).'</a>';
					if($i == 9){
						print "</table></br><h4>weitere</h4>";
						print '<span data-toggle="collapse" data-target="#mss" class="btn btn-circle"><i class="fa fa-angle-double-down animated" style = "font-size:1.5em;text-align:center;"></i></span>';
						print "</br><div id = 'mss' class = 'collapse'></br>";
					}
					$i = $i + 1;
				}
				if($i > 10){
					print "</div>";
				}
				?>
			  
			</div> 
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="content-section text-center">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <h2>Interessiert? Kontaktieren Sie uns:</h2>
            <p>Wenn Sie mehr Informationen über unser Projekt haben möchten, würden wir uns freuen wenn Sie uns kontaktieren.</p>
			<button data-toggle="modal" href="#myModal" class= "btn btn-default btn-lg">Kontakt</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Section -->
    <div id="map-container" class="col-lg-12"></div>

    <!-- Footer -->
    <footer style = "font-size:1.2em;">
      <div class="container text-center">
		<p><a target="_blank" href= "http://www.htl.rennweg.at">HTL Rennweg</a></p>
		<p>Wien 1030, Rennweg 89b</p>
        <p>SGREENING Team</p>
      </div>
    </footer>

    <!-- Bootstrap core JavaScript -->
    <script src="vendor/jquery/jquery.min.js"></script>
    <script src="vendor/popper/popper.min.js"></script>
    <script src="vendor/bootstrap/js/bootstrap.min.js"></script>

    <!-- Plugin JavaScript -->
    <script src="vendor/jquery-easing/jquery.easing.min.js"></script>

    <!-- Google Maps API Key - Use your own API key to enable the map feature. More information on the Google Maps API can be found at https://developers.google.com/maps/ -->
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBGIBpSuGI37YWz6gzBaoAY_t_VJiUP8Co&sensor=false"></script>
	   <script>	
 
      function init_map() {
		var var_location = new google.maps.LatLng(48.190776,16.397527);
 
        var var_mapoptions = {
          center: var_location,
          zoom: 15
        };
 
		var var_marker = new google.maps.Marker({
			position: var_location,
            map: var_map,
			title:"Venice"});
 
        var var_map = new google.maps.Map(document.getElementById("map-container"),
            var_mapoptions);
 
		var_marker.setMap(var_map);	
 
      }
 
      google.maps.event.addDomListener(window, 'load', init_map);
 
    </script>

    <!-- Custom scripts for this template -->
    <script src="js/grayscale.min.js"></script>

  </body>

</html>
