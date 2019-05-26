ROBOT=bin/robot
TARGET=target

all: $(TARGET)/cl-simple.owl $(TARGET)/all_terms.csv $(TARGET)/parent_terms.csv $(TARGET)/related_terms.csv


$(TARGET)/cl-simple.owl: cl.owl
	$(ROBOT) merge --input cl.owl reason relax -o $@

$(TARGET)/all_terms.csv: $(TARGET)/cl-simple.owl sparql/get_all_terms.sparql
	$(ROBOT) query --input $< --query sparql/get_all_terms.sparql  $@

$(TARGET)/parent_terms.csv: $(TARGET)/cl-simple.owl sparql/get_parents.sparql
	$(ROBOT) query --input $< --query sparql/get_parents.sparql  $@

$(TARGET)/related_terms.csv: $(TARGET)/cl-simple.owl sparql/get_related_terms.sparql
	$(ROBOT) query --input $< --query sparql/get_related_terms.sparql  $@

