import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Table from '../../../common-modules/client/components/table/Table';
import * as crudAction from '../../../common-modules/client/actions/crudAction';
import { getPropsForAutoComplete } from '../../../common-modules/client/utils/formUtil';

const getColumns = ({ klassTypes }) => [
  { field: 'key', title: 'מזהה' },
  { field: 'name', title: 'שם' },
  {
    field: 'klass_type_id',
    title: 'סוג כיתה',
    columnOrder: 'klass_types.name',
    ...getPropsForAutoComplete('klass_type_id', klassTypes),
  },
];
const getFilters = ({ klassTypes }) => [
  { field: 'klasses.key', label: 'מזהה', type: 'text', operator: 'like' },
  { field: 'klasses.name', label: 'שם', type: 'text', operator: 'like' },
  {
    field: 'klass_types.id',
    label: 'סוג כיתה',
    type: 'list',
    operator: 'eq',
    list: klassTypes,
    idField: 'id',
  },
];

const KlassesContainer = ({ entity, title }) => {
  const dispatch = useDispatch();
  const {
    GET: { 'get-edit-data': editData },
  } = useSelector((state) => state[entity]);

  const columns = useMemo(() => getColumns(editData || {}), [editData]);
  const filters = useMemo(() => getFilters(editData || {}), [editData]);

  useEffect(() => {
    dispatch(crudAction.customHttpRequest(entity, 'GET', 'get-edit-data'));
  }, []);

  return <Table entity={entity} title={title} columns={columns} filters={filters} />;
};

export default KlassesContainer;
