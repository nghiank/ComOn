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
	$scope.title_row = 2;
	$scope.nextDisabled = true;
	$scope.showAll = false;

	$scope.authorized = function() {
		if($scope.global.authenticated && ($scope.global.user.isAdmin || $scope.global.user.isManufacturer))
			return true;
		return false;
	};

	$scope.toggleShowAll = function(){
		$scope.showAll = !$scope.showAll;
	};

	$scope.isPending = function(sheet){
		if(!$scope.showAll)
			return (!sheet.dName);
		return true;
	};

	$scope.sheetSorted = function(sheet){
		/*The sheets are ordered in this order: 
		1)Pending sheets are always on the top;
		2)Matched sheets at the bottom (if shown);
		3)Untrack does not affect the order
		4)Within each, the order is by sName, aphabetical.
		*/
		var weight = sheet.dName ? 1 : 0;
		return weight + sheet.sName;
	};

	$scope.fileSelect = function($files) {
		$scope.showProgress  = false;
		var check = $scope.formValidator.checkFileExtension($files[0]?$files[0].name:'', ['xls']);
		if(check.result)
		{
			$scope.uploadDisabled = false;
			$scope.file = $files[0];
			$scope.sheets = [];
			$scope.processedSheets = [];
			$scope.pendingSheets = [];
		}
		$scope.success = check.suc_message;
		$scope.valid = check.result;
		$scope.error = check.err_message;
	};

	$scope.populate = function() {
		$scope.populateProgress = 0;
		var reader = new FileReader();
		reader.onload = function(){
			var wb = $scope.xls.read(reader.result, {type: 'binary'});
			$scope.wb = wb;
			$scope.getSheets(wb);
			//$scope.startProcessing(wb);
		};
		reader.readAsBinaryString($scope.file);
	};

	$scope.getSheets = function(wb){
		if($scope.processedSheets.length > 0)
			return;
		$scope.sheets = wb.SheetNames;
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
					processedSheet = {'sName':$scope.sheets[j]};
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
		if($scope.showAll) return sheet.dName && (!sheet.unTrack);
		return (sheet.pendingFields !== 0) && sheet.dName && (!sheet.unTrack);
	};

	$scope.sheetSortedByPendingFields = function(sheet){
		var weight = sheet.pendingFields !== 0 ? 0 : 1;
		return weight + sheet.sName;
	};

	$scope.isFieldPending = function(field){
		return field[1] === '';
	};

	$scope.sortedFields = function(field){
		var weight = field[1] === '' ? 0 : 1;
		return weight + field[0];
	};
	

	$scope.stopTrackingSheet = function(sheet){
		for(var i in $scope.pendingSheets){
			if($scope.pendingSheets[i].sName === sheet.sName){
				$scope.pendingSheets[i].unTrack = true;
			}
		}
		for(var j in $scope.processedSheets){
			if($scope.processedSheets[j].sName === sheet.sName){
				$scope.processedSheets[j].unTrack = true;
			}
		}
	};


	$scope.$watch('pendingSheets', function(){
		for(var i in $scope.pendingSheets)
			if((!$scope.pendingSheets[i].dName) && (!$scope.pendingSheets[i].unTrack)){

				$scope.nextDisabled = true;
				return;
			}
		$scope.nextDisabled = false;
	},true);

	$scope.startProcessing = function(wb) {
		$scope.showProgress = true;
		var user = $scope.global.user;
		function checkAuthority(manufacturerEntry)
		{
			return user.isAdmin? true: (user.codeName.toLowerCase() === manufacturerEntry.toLowerCase());
		}
		function invalid_man() {
			return 'The codename in your profile does not match the manufacturer field in the sheet '+key+'.';
		}
		function getMatchingColumn(key, fields) {
			if(!fields)
				return null;
			var newTitle = _.has(fields, key)? fields.key: null;
			return newTitle;
		}
		var json_obj = {};

		var count = 0;
		$scope.populateProgress = 20;

		for (var key in wb.Sheets){
			count ++;
		}
		$scope.totalSheetNo = count;
		count = 0;

		for (key in wb.Sheets) {
			count ++;
			var sheet, sheet_data, row_data, columnFlag, rowFlag, column, row;
			if(wb.Sheets.hasOwnProperty(key) && _.has($scope.processedSheets, key))
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
							var updated_column_title = getMatchingColumn(column_title.toLowerCase(), $scope.processedSheets.key.fields);
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
				json_obj[$scope.processedSheets.key.db? $scope.processedSheets.key.db.code: key] = {title: ($scope.processedSheets.key.db? $scope.processedSheets.key.db.name: (sheet.A1? sheet.A1.w: '')), data: sheet_data};
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