const structurePaginator = (pageNum, limit, data, totalNotesCount) => {
  
    const results = {};
    
    //structure the data

    results.results = data;

    results.totalNotes = totalNotesCount;
  
    results.totalPages = Math.ceil(totalNotesCount / limit);

    results.currentPage = pageNum;
  

    return results;
  };
  
  module.exports = { structurePaginator };