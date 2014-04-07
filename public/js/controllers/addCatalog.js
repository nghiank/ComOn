'use strict';

angular.module('ace.catalog').controller('catalogController', ['CatalogAPI', 'formValidation', '$scope', 'Global', '$modal', '_', function (CatalogAPI, formValidation, $scope, Global, $modal, _) {
	$scope.global = Global;
	$scope.formValidator = formValidation;
	$scope.uploadDisabled = true;
	$scope.xls = window.XLS;
	$scope.xlsx = window.XLSX;
	$scope.states = [1,0,0];
	$scope.sheets = [];
	$scope.processedSheets = [];
	$scope.nextDisabled = true;
	$scope.showAll = false;
	$scope.showAllFields = false;
	$scope.newBeginning = true;
	$scope.sheetTitle = 'A1';
	$scope.title_row = 2;

	$scope.showConfigureModal = function () {
		var modalInstance = $modal.open({
			templateUrl: 'views/Catalog/configureXlsModal.html',
			controller: 'configureXlsModalCtrl',
			resolve: {
				data: function () {
					return {
						title: $scope.sheetTitle,
						column_row: $scope.title_row
					};
				}
			}
		});
		modalInstance.result.then(function(result){
			if(result){
				$scope.newBeginning = true;
				$scope.title_row = result.fields;
				$scope.sheetTitle = result.title;
			}
		});
	};

	$scope.authorized = function() {
		if($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
			return true;
		return false;
	};

	$scope.toggleShowAll = function(number){
		if(number === 1)
			$scope.showAll = !$scope.showAll;
		if(number === 2)
			$scope.showAllFields = !$scope.showAllFields;
	};

	$scope.isPending = function(sheet){
		if(!$scope.showAll)
			return (sheet.pending);
		return true;
	};

	$scope.sheetSorted = function(sheet){
		/*The sheets are ordered in this order:
		1)Pending sheets are always on the top;
		2)Matched sheets at the bottom (if shown);
		3)Untrack does not affect the order
		4)Within each, the order is by sName, aphabetical.
		*/
		var weight = sheet.pending ? 0 : 1;
		return weight + sheet.sName;
	};

	$scope.fileSelect = function($files) {
		var check = $scope.formValidator.checkFileExtension($files[0]?$files[0].name:'', ['xls']);
		if(check.result)
		{
			$scope.newBeginning = true;
			$scope.uploadDisabled = false;
			$scope.file = $files[0];
			$scope.sheets = [];
			$scope.processedSheets = [];
		}
		$scope.success = check.suc_message;
		$scope.valid = check.result;
		$scope.error = check.err_message;
	};

	$scope.populate = function() {
		$scope.populateProgress = 0;
		$scope.parsingXLS = true;
		var reader = new FileReader();
		reader.onload = function(){
			var wb = $scope.xls.read(reader.result, {type: 'binary'});
			$scope.wb = wb;
			$scope.getSheets();
			$scope.states[1] = 1;
			$scope.states[0] = 0;
			$scope.newBeginning = false;
			$scope.parsingXLS = false;
		};
		reader.readAsBinaryString($scope.file);
	};

	$scope.getSheets = function(){
		var wb = $scope.wb;
		if($scope.processedSheets.length > 0)
			return;
		$scope.sheets = [];
		for(var j in wb.Sheets)
		{
			var single = wb.Sheets[j];

			var all_keys = _.keys(single);
			for(var i = 0; i < all_keys.length; i++)
			{
				var cell = all_keys[i];
				var matches = cell.match(/\d+$/);
				if(matches)
				{
					var number = matches[0];
					number = parseInt(number, 10);
					if(number > $scope.title_row)
					{
						$scope.sheets.push(j);
						break;
					}
				}
			}
		}
		if($scope.sheets.length === 0)
		{
			$scope.success = null;
			$scope.valid = false;
			$scope.error = 'No sheets found in the workbook';
			return;
		}
		$scope.types = [];
		$scope.typeCodes = [];
		var processedSheet = null;
		CatalogAPI.types.query(function(response){
			$scope.types = response;
			for(var i in response){
				if(response[i].code)
					$scope.typeCodes.push(response[i].code);
			}
			for (var j in $scope.sheets){
				if($scope.typeCodes.indexOf($scope.sheets[j]) > -1)
					processedSheet = {'sName':$scope.sheets[j],'dName':$scope.sheets[j]};
				else
					processedSheet = {'sName':$scope.sheets[j],'pending':true};
				$scope.processedSheets.push(processedSheet);
			}
		});
	};

	$scope.matchFields = function(){
		var wb = $scope.wb;
		var count = -1;
		function match_field(j, cols)
		{
			var std_fields = [];
			CatalogAPI.fields.query({type:$scope.processedSheets[j].dName},function(response){
				for(var k in response){
					var std_field = _.values(response[k]).join('');
					if(std_field.indexOf('additionalInfo') > -1)
						std_field = std_field.substr(15);
					std_fields.push(std_field);
				}
				k = 0;
				$scope.processedSheets[j].fields = [];
				for (k in cols){
					var fieldMatchPair = [];
					if(std_fields.indexOf(cols[k].toLowerCase()) > -1){
						fieldMatchPair.push(cols[k]);
						fieldMatchPair.push(std_fields[std_fields.indexOf(cols[k].toLowerCase())]);
					}else{
						fieldMatchPair.push(cols[k]);
						fieldMatchPair.push('');
						$scope.processedSheets[j].pendingFields++;
					}
					$scope.processedSheets[j].fields.push(fieldMatchPair);
				}
			});
		}

		for(var i in wb.Sheets){
			count++;
			var sheet_flag= false;
			for(var j in $scope.processedSheets){
				if($scope.processedSheets[j].sName === wb.SheetNames[count] && $scope.processedSheets[j].dName && !$scope.processedSheets[j].unTrack){
					sheet_flag = true;
					$scope.processedSheets[j].pendingFields = 0;
					break;
				}
			}
			if(sheet_flag){
				var sheet = wb.Sheets[i];
				var cols = [];
				var column = 'A';
				var col_flag = true;
				var column_titles_row = $scope.title_row.toString();
				while(col_flag){
					if(!sheet[column+column_titles_row] || !sheet[column+column_titles_row].w)
					{
						col_flag = false;
						break;
					}
					var column_title = sheet[column+column_titles_row].w;
					if(cols.indexOf(column_title) < 0)
						cols.push(column_title);
					column = $scope.getNextColumnToRead(column.split(''));
					if(!column)
					{
						col_flag = false;
						break;
					}
				}
				match_field(j, cols);
			}
		}
	};

	$scope.isSheetPendingByFields = function(sheet){
		if($scope.showAllFields) return sheet.dName && (!sheet.unTrack);
		return (sheet.pendingFields !== 0) && sheet.dName && (!sheet.unTrack);
	};

	$scope.countPendingByFields = function(){
		var count = 0;
		for(var i in $scope.processedSheets){
			var sheet = $scope.processedSheets[i];
			if(sheet.pendingFields !== 0 && sheet.dName && (!sheet.unTrack))
				count++;
		}
		return count;
	};

	$scope.sheetSortedByPendingFields = function(sheet){
		var weight = sheet.pendingFields !== 0 ? 0 : 1;
		return weight + sheet.sName;
	};

	$scope.isFieldPending = function(field){
		return field[1] === '';
	};
	
	$scope.showMatchFieldsModal = function(sheet){
		var modalInstance = $modal.open({
			templateUrl: 'views/Catalog/matchFieldsModal.html',
			controller: 'matchFieldsModalCtrl',
			resolve:{
				sheet: function() {
					return (sheet);
				}
			}
		});
		modalInstance.result.then(function(response){
			console.log(response);
			for(var i in $scope.processedSheets){
				if($scope.processedSheets[i].sName === response.sName)
					$scope.processedSheets[i] = response;
			}
		});
	};

	$scope.toggleTrackingSheet = function(sheet){
		for(var j in $scope.processedSheets){
			if($scope.processedSheets[j].sName === sheet.sName){
				$scope.processedSheets[j].unTrack = !$scope.processedSheets[j].unTrack;
				$scope.processedSheets[j].dName = null;
			}
		}
	};

	$scope.showTypesModal = function(sheet) {
		if(!$scope.global.user.isAdmin)
			return;
		var modalInstance = $modal.open({
			templateUrl: 'views/Catalog/addCustomTypeModal.html',
			controller: 'addCustomTypeModalCtrl',
			resolve: {
				data: function() {
					return {
						types: $scope.types,
						sheets: $scope.sheets,
						current: sheet,
						firstName: ($scope.wb.Sheets[sheet.sName]? ($scope.wb.Sheets[sheet.sName][$scope.sheetTitle]? $scope.wb.Sheets[sheet.sName][$scope.sheetTitle].w: ''): '')
					};
				}
			}
		});
		modalInstance.result.then(function(){
			$scope.typeCodes = [];
			for (var i = 0; i < $scope.types.length; i++) {
				$scope.typeCodes.push($scope.types[i].code);
			}
		});
		return;
	};

	$scope.$watch('processedSheets', function(){
		if($scope.sheets.length !== 0)
		{
			for(var i in $scope.processedSheets)
				if((!$scope.processedSheets[i].dName) && (!$scope.processedSheets[i].unTrack)){
					$scope.nextDisabled = true;
					return;
				}
			$scope.nextDisabled = false;
			return;
		}
		$scope.nextDisabled = true;
	},true);

	$scope.$watch('processedSheets', function(){
		if($scope.sheets.length !== 0)
		{
			for(var i in $scope.processedSheets)
				if($scope.processedSheets[i].pendingFields !== 0 && (!$scope.processedSheets[i].unTrack)){
					$scope.submitDisabled = true;
					return;
				}
			$scope.submitDisabled = false;
			return;
		}
		$scope.submitDisabled = true;
	},true);


	$scope.startProcessing = function() {
		var wb = $scope.wb;
		var user = $scope.global.user;

		function checkAuthority(manufacturerEntry)
		{
			return user.isAdmin? true: (user.codeName.toLowerCase() === manufacturerEntry.toLowerCase());
		}
		function invalid_man() {
			return 'The codename in your profile does not match the manufacturer field in the sheet '+key+'.';
		}
		function getSheetToBeProcessed(sheetName)
		{
			for(var i = 0; i< $scope.processedSheets.length; i++)
			{
				if($scope.processedSheets[i].sName === sheetName)
				{
					return $scope.processedSheets[i];
				}
			}
			return null;
		}
		function getMatchingColumn(key, fields) {
			if(fields.length === 0 || !key)
				return null;
			fields = _.object(fields);
			var newTitle = _.has(fields, key)? fields[key]: null;
			return newTitle;
		}
		function getTypeName(typeCode) {
			for (var i = 0; i < $scope.types.length; i++) {
				if($scope.types[i].code.toLowerCase() === typeCode.toLowerCase())
				{
					return $scope.types[i].name;
				}
			}
			return null;
		}
		var json_obj = {};

		var count = 0;

		$scope.totalSheetNo = $scope.processedSheets.length;
		var sheetsToSend = _.map($scope.processedSheets, function(object) {
			if(object.unTrack)
				return null;
			return object.sName? object.sName: null;
		});
		for (var j=0 ; j < sheetsToSend.length ; j++) {
			var key = sheetsToSend[j];
			var sheetToProcess = getSheetToBeProcessed(key);
			count ++;
			var sheet, sheet_data, row_data, columnFlag, rowFlag, column, row;
			if(wb.Sheets.hasOwnProperty(key))
			{
				sheet = wb.Sheets[key];
				sheet_data = [];
				row_data = {};
				columnFlag = true;
				rowFlag = true;
				column = 'A';
				var column_titles_row = $scope.title_row.toString();
				row = $scope.title_row + 1;
				while(rowFlag)
				{
					if(!sheet['A'+row.toString()] || !sheet['A'+row.toString()].w)
					{
						rowFlag = false;
						break;
					}
					while(columnFlag)
					{
						if(!sheet[column+column_titles_row] || !sheet[column+column_titles_row].w)
						{
							columnFlag = false;
							break;
						}
						var column_title = sheet[column+column_titles_row].w;
						if(!row_data[column_title.toLowerCase()])
						{
							var newCell = sheet[column+row.toString()]?sheet[column+row.toString()].w: '';
							//A manufacturer can only upload items under his own name
							if(column_title.toLowerCase() === 'manufacturer' && newCell !== '')
							{
								if(!checkAuthority(newCell))
								{
									$modal.open({
										templateUrl: 'views/errorAlertModal.html',
										controller: 'errorAlertModalCtrl',
										resolve: {
											message: invalid_man
										}
									});
									return;
								}
							}
							var updated_column_title = getMatchingColumn(column_title, sheetToProcess.fields);
							if(updated_column_title)
								row_data[updated_column_title] = newCell;
						}
						column = $scope.getNextColumnToRead(column.split(''));
						if(!column)
						{
							columnFlag = false;
							break;
						}
					}
					columnFlag = true;
					column = 'A';
					row+=1;
					if(row_data)
						sheet_data.push(row_data);
					row_data = {};
				}
				json_obj[sheetToProcess.dName? sheetToProcess.dName: key] = {title: (sheetToProcess.dName? getTypeName(sheetToProcess.dName): (sheet[[$scope.sheetTitle]]? sheet[$scope.sheetTitle].w: '')), data: sheet_data};
				sheet_data = [];
			}
			$scope.populateProgress = 20 +  Math.floor(count*100/$scope.totalSheetNo*0.6);
		}
		CatalogAPI.updateCatalog.save({data: json_obj}, function(response) {
			if(response)
			{
				$scope.populateProgress = 100;
			}
		});
	};

	$scope.countPending = function() {
		var count = 0;
		for(var i in $scope.processedSheets)
		{
			if((!$scope.processedSheets[i].dName) && (!$scope.processedSheets[i].unTrack)){
				count++;
			}
		}
		return count;
	};

	$scope.getNextColumnToRead = function(column)
	{
		var length = column.join('').length;
		function repeatChar(count, ch) {
			if (count === 0) {
				return '';
			}
			var count2 = count / 2;
			var result = ch;
			while (result.length <= count2) {
				result += result;
			}
			var finalResult = result + result.substring(0, count - result.length);
			return finalResult;
		}
		function getNextAlphabet(char) {
			return String.fromCharCode(char.charCodeAt(0)+1);
		}
		var endString = repeatChar(length, 'Z');
		if(column.join('') === endString)
			return repeatChar(length+1, 'A');
		if(column[length - 1] === 'Z')
		{
			var index = 1;
			while(length >= index && column[length - index] === 'Z')
			{
				column[length-index] = 'A';
				if(length > index && column[length-index-1] === 'Z')
				{
					index++;
				}
				else
				{
					column[length-index-1] = getNextAlphabet(column[length-index-1]);
					break;
				}
			}
		}
		else
		{
			column[length-1] = getNextAlphabet(column[length-1])[0];
		}
		return column.join('');
	};

}]);