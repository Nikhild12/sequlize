
Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
};

module.exports = {

    return_opt: {
        returning: true
    },

    plain_opt: {
        plain: true
    },

    return_plain_opt: {
        returning: true,
        plain: true
    },

    getFindQuery(postData) {
        let {
            pageNo,
            paginationSize,
            sortField,
            sortOrder
        } = postData;
        pageNo = pageNo ? pageNo : 0;
        let itemsPerPage = paginationSize ? paginationSize : 10;
        let offset = pageNo * itemsPerPage;
        let sortArr = ['created_date', 'DESC'];
        let fieldSplitArr = [];
        if (sortField) {
            fieldSplitArr = sortField.split('.');
            if (fieldSplitArr.length == 1) {
                sortArr[0] = sortField;
            } else {
                for (let idx = 0; idx < fieldSplitArr.length; idx++) {
                    const element = fieldSplitArr[idx];
                    fieldSplitArr[idx] = element.replace(/\[\/?.+?\]/ig, '');
                }
                sortArr = fieldSplitArr;
            }
        }
        if (sortOrder && ((sortOrder.toLowerCase() == 'asc') || (sortOrder.toLowerCase() == 'desc'))) {
            if ((fieldSplitArr.length == 1) || (fieldSplitArr.length == 0)) {
                sortArr[1] = sortOrder;
            } else {
                sortArr.push(sortOrder);
            }
        }

        return {
            offset: offset,
            limit: itemsPerPage,
            order: [
                sortArr,
            ]
        };
    },

    get_from_date(date_string) {
        var date = new Date(date_string).toISOString();
        return date;
    },

    get_to_date(date_string) {
        var date = new Date(date_string).addHours(24).toISOString();
        return date;
    },

    merge_arr_objs(a, b, prop) {
        return _.values(_.merge(_.keyBy(a, prop), _.keyBy(b, prop)));
    }
};